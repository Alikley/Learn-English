import { after } from "next/server";
import { z } from "zod";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getBookPdf, getBookPages } from "@/lib/ielts/pdf-text";
import { buildExamPaper, type PaperSkill } from "@/lib/ielts/paper-parser";
import { acquireAiPaper, aiPaperSlug, getAiPaperProgress, isAiExamConfigured } from "@/lib/ielts/ai-paper";
import { buildWritingPaper } from "@/lib/ielts/writing-paper";
// v1.0.4.5 (English 1.0.0.9): «IELTS_BOOK_COUNT» به‌جای ایمپورت مستقیم از
// طول «IELTS_BOOKS» گرفته می‌شود تا حتی با real-tests.ts قدیمی هم بیلد رد شود
// (رفع خطای Vercel: «Export IELTS_BOOK_COUNT doesn't exist in target module»).
import { cacheGet, cacheSet } from "@/lib/cache";
// v1.0.5.0 (English 1.0.1.0): ولیدیشن zod (سقف کتاب از IELTS_BOOKS.length
// داخل lib/validation.ts خوانده می‌شود — همان قاعدهٔ مقاوم v1.0.4.5)
// + سقف روزانهٔ ساخت برگهٔ AI (lib/ai-rate-limit)
import { validateQuery, bookIdParam, testIdParam, skillParam } from "@/lib/validation";
import { getAiQuota, consumeAiQuota, quotaMessage } from "@/lib/ai-rate-limit";

// ========================================
// GET /api/ielts/paper — برگهٔ امتحان (v1.0.5.0)
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

// v1.0.4.6: کش برگهٔ heuristic به دو سطحی رفت (L1 + Redis)
const PAPER_TTL_S = 15 * 60;

const GENERATING_REASON =
  "برگهٔ امتحان با هوش مصنوعی در حال ساخت است — این فقط یک بار انجام می‌شود و برای بازدیدهای بعدی ذخیره می‌گردد";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // v1.0.5.0 — ولیدیشن zod (همان پیام‌های قبلی، حالا type-safe)
  const base = validateQuery(req, z.object({ book: bookIdParam, pdf: z.string().optional(), refresh: z.string().optional() }));
  if (!base.ok) return base.response;
  const bookId = base.data.book;
  const force = base.data.refresh === "1";

  // ---------- خود فایل PDF ----------
  if (base.data.pdf === "1") {
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
  const paperQuery = validateQuery(
    req,
    z.object({ test: testIdParam, skill: skillParam }),
  );
  if (!paperQuery.ok) return paperQuery.response;
  const testId = paperQuery.data.test;
  const skill = paperQuery.data.skill as PaperSkill;

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
    // v1.0.5.0 — سقف روزانهٔ ساخت برگه (سهمیه فقط با شروع تولیدِ
    // تازه مصرف می‌شود — برگهٔ READY از کش دیتابیس بی‌شمارش است)
    const quota = await getAiQuota(auth.session.user.id, "ielts-paper");
    if (quota.remaining <= 0) {
      aiError = quotaMessage("ielts-paper", quota);
    } else {
    const state = await acquireAiPaper(bookId, testId, skill, force);

    if (state.status === "READY") {
      // آماده → تحویل فوری (کش حافظه/DB — بدون مصرف توکن)
      return ok({ ...state.paper, ok: true, aiGenerated: true });
    }

    if (state.status === "STARTED") {
      // تولید تازه شروع می‌شود → سهمیه همین‌جا مصرف شود
      await consumeAiQuota(auth.session.user.id, "ielts-paper");
      // تولید در پس‌زمینه — پاسخ سریع، کلاینت poll می‌کند
      after(() => state.run());
      // v1.0.6.1 — درصد پیشرفت واقعی برای نمایش در صفحهٔ ساخت
      return ok({
        ok: false,
        generating: true,
        reason: GENERATING_REASON,
        progress: getAiPaperProgress(aiPaperSlug(bookId, testId, skill)),
      });
    }

    if (state.status === "GENERATING") {
      // فرایند دیگری (یا همین) در حال ساخت است
      return ok({
        ok: false,
        generating: true,
        reason: GENERATING_REASON,
        progress: getAiPaperProgress(aiPaperSlug(bookId, testId, skill)),
      });
    }

    // FAILED → ادامه به مسیر جایگزین (بدون retry خودکار — صرفه‌جویی توکن)
    aiError = state.error;
    }
  }

  // ========================================
  // مسیر ۲ — پارسر heuristic قدیمی (جایگزین — ریدینگ/لیسنینگ)
  // ========================================
  const cacheKey = `paper:${bookId}-${testId}-${skill}`;
  if (!force) {
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) {
      return ok(cached);
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
    await cacheSet(cacheKey, json, PAPER_TTL_S);
  }
  return ok(json);
}
