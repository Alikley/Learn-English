import { after } from "next/server";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getBookPdf, getBookPages } from "@/lib/ielts/pdf-text";
import { buildExamPaper, type PaperSkill } from "@/lib/ielts/paper-parser";
import { acquireAiPaper, isAiExamConfigured } from "@/lib/ielts/ai-paper";
import { buildWritingPaper } from "@/lib/ielts/writing-paper";
import { IELTS_BOOK_COUNT } from "@/lib/ielts/real-tests";

// ========================================
// GET /api/ielts/paper — برگهٔ امتحان (v1.0.4.3)
//
//   ?book=1&test=1&skill=reading|listening|writing
//     → برگهٔ امتحان ساختاریافته
//
//   ?book=1&pdf=1
//     → خود فایل PDF (برای نمایشگر کتاب)
//
//   ?refresh=1 → ساخت دوبارهٔ برگهٔ AI / بازبینی صفحات رایتینگ
//
// جریان اصلی:
//   ۱) رایتینگ (v1.0.4.3): بدون AI — صفحات صورت سوال از
//      نقشهٔ تأییدشده/تشخیص متن → کلاینت صفحهٔ واقعی کتاب
//      را با #page باز می‌کند. همیشه فوری.
//   ۲) ریدینگ/لیسنینگ: برگهٔ AI از کش دائمی (MySQL — جدول
//      IeltsAiPaper) → فوری؛ اولین بازدید → تولید با
//      CodeCraft در پس‌زمینه (after) و پاسخ { generating:true }
//   ۳) اگر AI شکست خورد/غیرفعال بود → پارسر heuristic قدیمی
//   ۴) هیچ‌کدام → { ok:false } → رابط کاربری PDF جایگزین
// ========================================

const PAPER_TTL_MS = 15 * 60 * 1000;

type PaperCacheEntry = { json: unknown; expiresAt: number };
const paperCache = new Map<string, PaperCacheEntry>();

const GENERATING_REASON =
  "برگهٔ امتحان با هوش مصنوعی در حال ساخت است — این فقط یک بار انجام می‌شود و برای بازدیدهای بعدی ذخیره می‌گردد";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const bookId = Number(url.searchParams.get("book") ?? "");
  const force = url.searchParams.get("refresh") === "1";

  if (!Number.isInteger(bookId) || bookId < 1 || bookId > IELTS_BOOK_COUNT) {
    return err(`کتاب نامعتبر است (۱..${IELTS_BOOK_COUNT})`, 400);
  }

  // ---------- خود فایل PDF ----------
  if (url.searchParams.get("pdf") === "1") {
    const pdf = await getBookPdf(bookId);
    if (!pdf.ok) return err(pdf.error, 404);
    return new Response(new Uint8Array(pdf.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="cambridge-${bookId}.pdf"`,
        "Cache-Control": "private, max-age=600",
      },
    });
  }

  // ---------- برگهٔ امتحان ----------
  const testId = Number(url.searchParams.get("test") ?? "");
  const skillParam = url.searchParams.get("skill") ?? "";
  if (!Number.isInteger(testId) || testId < 1 || testId > 4) {
    return err("تست نامعتبر است (۱..۴)", 400);
  }
  if (!["reading", "listening", "writing"].includes(skillParam)) {
    return err("مهارت نامعتبر است (reading/listening/writing)", 400);
  }
  const skill = skillParam as PaperSkill;

  // ========================================
  // رایتینگ (v1.0.4.3) — بدون AI، همیشه فوری:
  // صورت سوال = صفحات واقعی کتاب (نقشهٔ تأییدشده یا
  // تشخیص از متن) + متن تسک‌ها وقتی لایهٔ متنی موجود است
  // ========================================
  if (skill === "writing") {
    const wp = await buildWritingPaper(bookId, testId, force);
    if (!wp.ok) {
      return ok({ ok: false, reason: wp.reason });
    }
    return ok({
      ok: true,
      skill: "writing",
      testNumber: testId,
      sections: [],
      writing: wp.prompts,
      totalQuestions: 2,
      questionPaper: wp.questionPaper,
    });
  }

  // ========================================
  // مسیر ۱ — برگهٔ هوش مصنوعی (کش دائمی در DB)
  // (ریدینگ/لیسنینگ)
  // ========================================
  let aiError: string | null = null;
  if (isAiExamConfigured()) {
    const state = await acquireAiPaper(bookId, testId, skill, force);

    if (state.status === "READY") {
      // آماده → تحویل فوری (کش حافظه/DB — بدون مصرف توکن)
      return ok({ ...state.paper, ok: true, aiGenerated: true });
    }

    if (state.status === "STARTED") {
      // تولید در پس‌زمینه — پاسخ سریع، کلاینت poll می‌کند
      after(() => state.run());
      return ok({ ok: false, generating: true, reason: GENERATING_REASON });
    }

    if (state.status === "GENERATING") {
      // فرایند دیگری (یا همین) در حال ساخت است
      return ok({ ok: false, generating: true, reason: GENERATING_REASON });
    }

    // FAILED → ادامه به مسیر جایگزین (بدون retry خودکار — صرفه‌جویی توکن)
    aiError = state.error;
  }

  // ========================================
  // مسیر ۲ — پارسر heuristic قدیمی (جایگزین — ریدینگ/لیسنینگ)
  // ========================================
  const cacheKey = `${bookId}-${testId}-${skill}`;
  if (!force) {
    const cached = paperCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return ok(cached.json);
    }
  }

  const pagesResult = await getBookPages(bookId, force);
  if (!pagesResult.ok) {
    return ok({
      ok: false,
      reason: pagesResult.error,
      ...(aiError ? { aiError } : {}),
    });
  }

  const paper = buildExamPaper(pagesResult.pages, testId, skill);
  const json = {
    ...paper,
    source: pagesResult.source,
    ...(aiError ? { aiError } : {}),
  };
  if (paper.ok) {
    paperCache.set(cacheKey, { json, expiresAt: Date.now() + PAPER_TTL_MS });
  }
  return ok(json);
}
