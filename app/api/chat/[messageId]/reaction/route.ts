import { NextRequest } from "next/server";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { ensureUserRow } from "@/lib/ensure-user";
import type { ChatReactionType } from "@/types/chat";
// v1.0.7.1 (English 1.0.1.14) — پارس بدنه با zod به‌جای دستی
import { validateJson, chatReactionSchema } from "@/lib/validation";

// ========================================
// واکنش به پیام چت — لایک / دیسلایک / حذف واکنش
// (v1.0.3.0 — گام ۴ و ۵ / v1.0.3.1 — رفع باگ FK)
//
// POST /api/chat/[messageId]/reaction  body: { type }
//   type = 1  → لایک 👍
//   type = -1 → دیسلایک 👎
//   type = 0  → حذف واکنش
// هر کاربر برای هر پیام فقط یک واکنش دارد (لایک یا دیسلایک)
// پاسخ: { likes, dislikes, myReaction }
// ========================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const p = prisma as unknown as Record<string, unknown>;
  if (!p.chatMessage || !p.chatReaction) {
    return err(
      "جدول‌های چت آماده نیست — دستور «npx prisma generate» و بعد «npx prisma migrate deploy» را اجرا کن",
      500,
    );
  }

  const uid = auth.session.user.id;
  const { messageId } = await params;

  const parsed = await validateJson(req, chatReactionSchema);
  if (!parsed.ok) return parsed.response;
  const type = parsed.data.type;

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { id: true },
  });
  if (!message) return err("پیام پیدا نشد", 404);

  if (type === 0) {
    // حذف واکنش
    await prisma.chatReaction.deleteMany({
      where: { messageId, userId: uid },
    });
  } else {
    // ✅ v1.0.3.1 — تضمین رکورد کاربر پیش از نوشتن (رفع خطای FK)
    await ensureUserRow(auth.session);

    await prisma.chatReaction.upsert({
      where: { messageId_userId: { messageId, userId: uid } },
      create: { messageId, userId: uid, type },
      update: { type },
    });
  }

  // شمارش نهایی از سرور — مقدار قطعی به کلاینت برمی‌گردد
  const reactions = await prisma.chatReaction.findMany({
    where: { messageId },
    select: { userId: true, type: true },
  });

  const likes = reactions.filter((r) => r.type === 1).length;
  const dislikes = reactions.filter((r) => r.type === -1).length;
  const mine = reactions.find((r) => r.userId === uid);
  const myReaction: ChatReactionType = !mine ? 0 : mine.type === 1 ? 1 : -1;

  return ok({ likes, dislikes, myReaction });
}
