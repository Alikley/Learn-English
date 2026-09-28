import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getBookPages, getBookPdf } from "@/lib/ielts/pdf-text";
import { buildExamPaper, type PaperSkill } from "@/lib/ielts/paper-parser";

// ========================================
// GET /api/ielts/paper — برگهٔ امتحان از متن PDF (v1.0.3.6)
//
//   ?book=1&test=1&skill=reading|listening|writing
//     → برگهٔ امتحان ساخت‌یافته (سوال‌های واقعی از PDF)
//
//   ?book=1&pdf=1
//     → خود فایل PDF (برای نمایشگر کتاب)
//
// برگه‌ها ۱۵ دقیقه کش می‌شوند؛ ?refresh=1 کش را می‌شکند.
// ========================================

const PAPER_TTL_MS = 15 * 60 * 1000;

type PaperCacheEntry = { json: unknown; expiresAt: number };
const paperCache = new Map<string, PaperCacheEntry>();

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const bookId = Number(url.searchParams.get("book") ?? "");
  const force = url.searchParams.get("refresh") === "1";

  if (!Number.isInteger(bookId) || bookId < 1 || bookId > 8) {
    return err("کتاب نامعتبر است (۱..۸)", 400);
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

  const cacheKey = `${bookId}-${testId}-${skill}`;
  if (!force) {
    const cached = paperCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return ok(cached.json);
    }
  }

  const pagesResult = await getBookPages(bookId, force);
  if (!pagesResult.ok) {
    return ok({ ok: false, reason: pagesResult.error });
  }

  const paper = buildExamPaper(pagesResult.pages, testId, skill);
  const json = { ...paper, source: pagesResult.source };
  if (paper.ok) {
    paperCache.set(cacheKey, { json, expiresAt: Date.now() + PAPER_TTL_MS });
  }
  return ok(json);
}
