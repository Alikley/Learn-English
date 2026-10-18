import { requireAuth, ok, err } from "@/lib/api-helpers";
import { ensureUserRow } from "@/lib/ensure-user";
import { prisma } from "@/prisma/prisma-client";
import { notifyUser } from "@/lib/notify";
// v1.0.7.1 (English 1.0.1.14) — پارس query/بدنه با zod به‌جای دستی
import {
  validateQuery,
  validateJson,
  bookProgressQuerySchema,
  bookProgressPostSchema,
} from "@/lib/validation";

// ========================================
// پیشرفت مطالعهٔ کتاب‌ها — v1.0.3.3 (گام ۴)
//
// GET  /api/books/progress            → همهٔ پیشرفت‌های کاربر
// GET  /api/books/progress?bookId=3   → پیشرفت یک کتاب
// POST /api/books/progress { bookId, page, totalPages, finished? }
//                                     → ذخیره/به‌روزرسانی (upsert)
//
// صفحهٔ مطالعهٔ کتاب هر تغییر صفحه را اینجا ذخیره
// می‌کند تا پیشرفت بین دستگاه‌ها همگام بماند؛
// localStorage همچنان به‌عنوان ذخیرهٔ محلی می‌ماند.
// ========================================

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const qp = validateQuery(req, bookProgressQuerySchema);
  if (!qp.ok) return qp.response;
  const bookId = qp.data.bookId ?? null;

  const where =
    bookId !== null
      ? { userId: auth.session.user.id, bookId }
      : { userId: auth.session.user.id };

  const rows = await prisma.bookProgress.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      bookId: true,
      page: true,
      totalPages: true,
      finished: true,
      updatedAt: true,
    },
  });

  return ok({ progress: rows });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const parsed = await validateJson(req, bookProgressPostSchema);
  if (!parsed.ok) return parsed.response;
  const { bookId, page, totalPages, finished } = parsed.data;

  // کتاب باید واقعاً وجود داشته باشد (FK)
  // v1.0.6.9 — title/titleFa برای اعلان تمام‌شدن کتاب
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, title: true, titleFa: true },
  });
  if (!book) return err("کتاب یافت نشد", 404);

  await ensureUserRow(auth.session);

  // v1.0.6.9 — وضعیت قبلی برای اعلان: اعلان فقط وقتی است که
  // «تمام‌شدن» تازه رخ داده باشد (قبلاً finished نبوده)
  const existingProgress = await prisma.bookProgress.findUnique({
    where: { userId_bookId: { userId: auth.session.user.id, bookId } },
    select: { finished: true },
  });
  const wasFinishedBefore = existingProgress?.finished === true;

  const row = await prisma.bookProgress.upsert({
    where: { userId_bookId: { userId: auth.session.user.id, bookId } },
    create: {
      userId: auth.session.user.id,
      bookId,
      page,
      totalPages,
      finished,
    },
    update: { page, totalPages, finished },
    select: {
      bookId: true,
      page: true,
      totalPages: true,
      finished: true,
      updatedAt: true,
    },
  });

  // v1.0.6.9 — اعلان تمام‌شدن کتاب (هرگز خطا نمی‌دهد)
  if (finished && !wasFinishedBefore) {
    const title = book.titleFa ?? book.title;
    await notifyUser(auth.session.user.id, {
      type: "book",
      link: "/library",
      titleFa: `📖 کتاب «${title}» تمام شد`,
      titleEn: `📖 Book "${book.title}" finished`,
      textFa: "کل کتاب را خواندی! کتاب بعدی را از کتابخانه انتخاب کن.",
      textEn: "You read the whole book! Pick your next one from the library.",
    });
  }

  return ok(row);
}
