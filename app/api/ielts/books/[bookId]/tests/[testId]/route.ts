import { requireAuth, ok, err } from "@/lib/api-helpers";
import { scanCambridge } from "@/lib/b2-cambridge";
import { getTestById } from "@/lib/ielts/real-tests";
import { buildMediaInfo } from "@/lib/ielts/media-info";

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

  const { bookId: bookIdParam, testId: testIdParam } = await params;
  const bookId = Number(bookIdParam);
  const testId = Number(testIdParam);

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
