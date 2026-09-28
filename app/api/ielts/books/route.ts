import { requireAuth, ok } from "@/lib/api-helpers";
import { scanCambridge } from "@/lib/b2-cambridge";
import { IELTS_BOOKS } from "@/lib/ielts/real-tests";
import { toAttemptSummary, ATTEMPT_SELECT } from "@/lib/ielts/attempt-view";
import { hasLocalPdf } from "@/lib/ielts/pdf-text";
import { prisma } from "@/prisma/Prisma client";
import type { IeltsBookSummary, IeltsScanInfo } from "@/types/ielts";

// ========================================
// GET /api/ielts/books — فهرست ۸ کتاب کمبریج (v1.0.3.3)
// REST API بخش آیلتس با شناسهٔ عددی:
//   [{ id: 1..8, slug, titleFa, titleEn, tests: [۴ تست], files }]
// + وضعیت فایل‌های باکت B2 + تلاش‌های کاربر
// ?refresh=1 → اسکن مجدد باکت (پس از آپلود فایل جدید)
// ========================================

function toScanInfo(scan: Awaited<ReturnType<typeof scanCambridge>>): IeltsScanInfo {
  return {
    configured: scan.configured,
    source: scan.source,
    bucketName: scan.bucketName,
    totalFiles: scan.totalFiles,
    unmatchedFiles: scan.unmatchedFiles,
    error: scan.error,
  };
}

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const scan = await scanCambridge(refresh);

  const books: IeltsBookSummary[] = IELTS_BOOKS.map((book) => {
    const files = scan.books[book.id];
    return {
      id: book.id,
      slug: book.slug,
      titleFa: book.titleFa,
      titleEn: book.titleEn,
      tests: book.tests.map((t) => ({
        id: t.id,
        slug: t.slug,
        bookNumber: t.bookNumber,
        testNumber: t.testNumber,
        reading: t.reading,
        listening: t.listening,
        writing: t.writing,
      })),
      files: {
        pdf: !!files?.pdfPath || hasLocalPdf(book.id),
        pdfPath: files?.pdfPath ?? null,
        audioCount: files?.audioFiles.length ?? 0,
      },
    };
  });

  const attempts = await prisma.ieltsAttempt.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { startedAt: "desc" },
    select: ATTEMPT_SELECT,
  });

  return ok({
    books,
    scan: toScanInfo(scan),
    attempts: attempts.map(toAttemptSummary),
  });
}
