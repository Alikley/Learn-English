import { NextRequest } from "next/server";
import { prisma } from "@/prisma/Prisma client";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { reportError } from "@/lib/report-error";

// ========================================
// اعلان‌های واقعی کاربر (v1.0.6.9 / English 1.0.1.12)
//
// GET    → ۶۰ اعلان آخر کاربر (جدید→قدیم) + تعداد ناخوانده
// PATCH  → علامت‌گذاری خوانده‌شده: { id } یا { all: true }
//          (id + userId در where → امنیت مالکیت)
// DELETE → حذف یک اعلان: { id } (id + userId در where)
//
// ردیف‌ها را lib/notify.ts از رویدادهای واقعی سایت می‌سازد.
// ========================================

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return ok({ notifications, unreadCount });
  } catch (e) {
    reportError(e, { route: "/api/notifications:GET", userId });
    return err("خطا در دریافت اعلان‌ها", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : null;
    const all = body?.all === true;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (id) {
      // id + userId در where → مالکیت امن (ردیف دیگران دست نمی‌خورد)
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true, readAt: new Date() },
      });
    } else {
      return err("شناسهٔ اعلان لازم است (یا all: true)", 400);
    }

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return ok({ success: true, unreadCount });
  } catch (e) {
    reportError(e, { route: "/api/notifications:PATCH", userId });
    return err("خطا در ثبت خوانده‌شدن اعلان", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : null;

    if (!id) {
      return err("شناسهٔ اعلان لازم است", 400);
    }

    // id + userId در where → مالکیت امن
    await prisma.notification.deleteMany({
      where: { id, userId },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return ok({ success: true, unreadCount });
  } catch (e) {
    reportError(e, { route: "/api/notifications:DELETE", userId });
    return err("خطا در حذف اعلان", 500);
  }
}
