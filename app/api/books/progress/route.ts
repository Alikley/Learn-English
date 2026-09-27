import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { updateStreak, getStreak } from "@/lib/streak";
import { NextRequest } from "next/server";

// ========================================
// پیشرفت مطالعه کتاب (v1.0.3.0 — گام ۲)
// POST /api/books/progress   body: { bookId: number, page: number }
// صفحه‌گردانی کتاب = فعالیت یادگیری → جزو روزهای متوالی حساب می‌شود.
// سبک و idempotent است: چند بار صدا زدن در یک روز فقط یک روز
// محسوب می‌شود (منطق updateStreak).
// ========================================

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  let body: { bookId?: unknown; page?: unknown } | null = null;
  try {
    body = (await req.json()) as { bookId?: unknown; page?: unknown };
  } catch {
    return err("درخواست نامعتبر است");
  }

  const bookId = Number(body?.bookId);
  const page = Number(body?.page);
  if (!Number.isInteger(bookId) || bookId <= 0)
    return err("شناسه کتاب نامعتبر است");
  if (!Number.isInteger(page) || page < 0)
    return err("شماره صفحه نامعتبر است");

  try {
    // کتاب واقعاً وجود داشته باشد
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return err("کتاب یافت نشد", 404);

    // ✅ خواندن کتاب جزو روزهای متوالی
    const streak = await updateStreak(userId);
    const fresh = await getStreak(userId);

    return ok({
      streak: { current: streak.current, longest: fresh.longest },
    });
  } catch {
    return err("خطای سرور — بعداً تلاش کنید", 500);
  }
}
