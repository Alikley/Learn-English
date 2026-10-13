import { requireAuth, ok, err } from "@/lib/api-helpers";
import { scanCambridge } from "@/lib/b2-cambridge";
// v1.0.4.5 (English 1.0.0.9): تعداد کتاب از طول IELTS_BOOKS — مقاوم در برابر
// real-tests.ts قدیمی (رفع خطای بیلد Vercel)
import { getBookById, bookSlugsForAttempts } from "@/lib/ielts/real-tests";
import { toAttemptSummary, ATTEMPT_SELECT } from "@/lib/ielts/attempt-view";
import { prisma } from "@/prisma/Prisma client";
// v1.0.5.0 (English 1.0.1.0): ولیدیشن zod پارامتر مسیر (سقف کتاب
// از IELTS_BOOKS.length داخل lib/validation.ts — قاعدهٔ مقاوم v1.0.4.5)
import { validateObject, bookIdPathParam } from "@/lib/validation";
import { z } from "zod";

// ========================================
// GET /api/ielts/books/[bookId] — جزئیات یک کتاب (v1.0.3.3)
// کتاب + هر ۴ تست + وضعیت فایل‌های B2 + تلاش‌های کاربر
// روی همین کتاب (شامل اسلاگ‌های قدیمی v1.0.3.2)
// ========================================

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { bookId: bookIdRaw } = await params;
  // v1.0.5.0 — ولیدیشن zod (پیام/کد وضعیت مثل قبل: ۴۰۴)
  const parsed = validateObject(z.object({ bookId: bookIdPathParam }), { bookId: bookIdRaw }, 404);
  if (!parsed.ok) return parsed.response;
  const bookId = parsed.data.bookId;

  const book = getBookById(bookId);
  if (!book) return err("کتاب یافت نشد", 404);

  const scan = await scanCambridge();
  const files = scan.books[bookId];

  const attempts = await prisma.ieltsAttempt.findMany({
    where: {
      userId: auth.session.user.id,
      testSlug: { in: bookSlugsForAttempts(bookId) },
    },
    orderBy: { startedAt: "desc" },
    select: ATTEMPT_SELECT,
  });

  return ok({
    book: {
      id: book.id,
      slug: book.slug,
      titleFa: book.titleFa,
      titleEn: book.titleEn,
      tests: book.tests,
    },
    files: {
      pdf: !!files?.pdfPath,
      pdfPath: files?.pdfPath ?? null,
      audioCount: files?.audioFiles.length ?? 0,
    },
    scan: {
      configured: scan.configured,
      source: scan.source,
      bucketName: scan.bucketName,
      totalFiles: scan.totalFiles,
      unmatchedFiles: scan.unmatchedFiles,
      error: scan.error,
    },
    attempts: attempts.map(toAttemptSummary),
  });
}
