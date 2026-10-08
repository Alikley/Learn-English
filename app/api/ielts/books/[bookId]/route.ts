import { requireAuth, ok, err } from "@/lib/api-helpers";
import { scanCambridge } from "@/lib/b2-cambridge";
import { getBookById, bookSlugsForAttempts, IELTS_MAX_BOOK } from "@/lib/ielts/real-tests";
import { toAttemptSummary, ATTEMPT_SELECT } from "@/lib/ielts/attempt-view";
import { prisma } from "@/prisma/Prisma client";

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

  const { bookId: bookIdParam } = await params;
  const bookId = Number(bookIdParam);
  if (!Number.isInteger(bookId) || bookId < 1 || bookId > IELTS_MAX_BOOK) {
    return err(`شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_MAX_BOOK})`, 404);
  }

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
