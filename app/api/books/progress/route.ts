import { requireAuth, ok, err } from "@/lib/api-helpers";
import { ensureUserRow } from "@/lib/ensure-user";
import { prisma } from "@/prisma/Prisma client";

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

  const url = new URL(req.url);
  const bookIdParam = url.searchParams.get("bookId");
  const bookId = bookIdParam ? Number(bookIdParam) : null;

  const where =
    bookId !== null && Number.isInteger(bookId) && bookId > 0
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

  let body: {
    bookId?: unknown;
    page?: unknown;
    totalPages?: unknown;
    finished?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return err("درخواست نامعتبر است");
  }

  const bookId = Number(body.bookId);
  const page = Number(body.page);
  const totalPages = Number(body.totalPages);
  const finished = body.finished === true;

  if (!Number.isInteger(bookId) || bookId <= 0) return err("شناسهٔ کتاب نامعتبر است");
  if (!Number.isInteger(page) || page < 0 || page > 100000) return err("شمارهٔ صفحه نامعتبر است");
  if (!Number.isInteger(totalPages) || totalPages < 0 || totalPages > 100000)
    return err("تعداد صفحه نامعتبر است");

  // کتاب باید واقعاً وجود داشته باشد (FK)
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true },
  });
  if (!book) return err("کتاب یافت نشد", 404);

  await ensureUserRow(auth.session);

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

  return ok(row);
}
