import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = notifications.filter(
      (n: (typeof notifications)[number]) => !n.isRead,
    ).length;
    return ok({ notifications, unreadCount });
  } catch {
    return err("خطا در دریافت اعلان‌ها", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const body = await req.json().catch(() => ({}));
    const id = body?.id as string | undefined;

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }

    return ok({ success: true });
  } catch {
    return err("خطا در آپدیت اعلان‌ها", 500);
  }
}
