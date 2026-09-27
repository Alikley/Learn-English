import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

// ========================================
// واکنش به پیام چت — لایک/دیسلایک (v1.0.3.0 — گام ۴)
// POST /api/chat/[id]/react   body: { value: 1 | -1 | 0 }
//   value= 1 → لایک / -1 → دیسلایک / 0 → حذف واکنش
// دوباره لایک کردن همان پیام = برداشتن لایک (toggle)
// پاسخ: { likes, dislikes, myReaction }
// ========================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const { id } = await params;

  let body: { value?: unknown } | null = null;
  try {
    body = (await req.json()) as { value?: unknown };
  } catch {
    return err("درخواست نامعتبر است");
  }

  const value = Number(body?.value);
  if (![1, -1, 0].includes(value))
    return err("واکنش نامعتبر است — فقط لایک، دیسلایک یا حذف");

  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!message) return err("پیام یافت نشد", 404);

    const existing = await prisma.chatReaction.findUnique({
      where: { messageId_userId: { messageId: id, userId } },
    });

    if (value === 0) {
      // حذف صریح
      if (existing) {
        await prisma.chatReaction.delete({ where: { id: existing.id } });
      }
    } else if (existing) {
      if (existing.value === value) {
        // toggle — همان واکنش دوباره → برداشته می‌شود
        await prisma.chatReaction.delete({ where: { id: existing.id } });
      } else {
        // تغییر لایک ↔ دیسلایک
        await prisma.chatReaction.update({
          where: { id: existing.id },
          data: { value },
        });
      }
    } else {
      await prisma.chatReaction.create({
        data: { messageId: id, userId, value },
      });
    }

    // شمارش تازه
    const reactions = await prisma.chatReaction.findMany({
      where: { messageId: id },
      select: { value: true, userId: true },
    });
    let likes = 0;
    let dislikes = 0;
    let myReaction: 1 | -1 | 0 = 0;
    for (const r of reactions) {
      if (r.value === 1) likes++;
      else if (r.value === -1) dislikes++;
      if (r.userId === userId) myReaction = r.value === 1 ? 1 : -1;
    }

    return ok({ likes, dislikes, myReaction });
  } catch {
    return err("خطای سرور — بعداً تلاش کنید", 500);
  }
}
