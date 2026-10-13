import { requireAuth, ok, err } from "@/lib/api-helpers";
import { scanCambridge } from "@/lib/b2-cambridge";
import { getTestById } from "@/lib/ielts/real-tests";
import { buildMediaInfo } from "@/lib/ielts/media-info";
// v1.0.5.0 (English 1.0.1.0): ولیدیشن zod پارامترهای مسیر
import { validateObject, bookIdPathParam, testIdParam } from "@/lib/validation";
import { z } from "zod";

// ========================================
// GET /api/ielts/books/[bookId]/tests/[testId] — جزئیات یک تست (v1.0.3.3)
// متادیتای تست + آدرس‌های رسانه‌ای (PDF کتاب + فایل‌های صوتی)
// بدون هیچ کلید پاسخ — محتوای سوال‌ها داخل PDF است
// ========================================

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookId: string; testId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { bookId: bookIdRaw, testId: testIdRaw } = await params;
  // v1.0.5.0 — ولیدیشن zod (پیام/کد وضعیت مثل قبل: ۴۰۴)
  const parsed = validateObject(
    z.object({ bookId: bookIdPathParam, testId: testIdParam }),
    { bookId: bookIdRaw, testId: testIdRaw },
    404,
  );
  if (!parsed.ok) return parsed.response;
  const bookId = parsed.data.bookId;
  const testId = parsed.data.testId;

  const test = getTestById(bookId, testId);
  if (!test) return err("آزمون یافت نشد (کتاب ۱..۲۱، تست ۱..۴)", 404);

  const scan = await scanCambridge();
  const media = buildMediaInfo(scan, test);

  return ok({
    test: {
      id: test.id,
      slug: test.slug,
      bookNumber: test.bookNumber,
      testNumber: test.testNumber,
      reading: test.reading,
      listening: test.listening,
      writing: test.writing,
    },
    media,
  });
}
