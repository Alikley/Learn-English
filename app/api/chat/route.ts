import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
          include: { sender: { select: { name: true, image: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        isRead: false,
        senderId: { not: userId },
        conversation: { participants: { some: { userId } } },
      },
      _count: true,
    });

    const unreadMap = Object.fromEntries(
      unreadCounts.map((u: { conversationId: string; _count: number }) => [
        u.conversationId,
        u._count,
      ]),
    );

    const result = conversations.map((c: (typeof conversations)[number]) => ({
      id: c.id,
      lastMessage: c.messages[0] ?? null,
      unreadCount: unreadMap[c.id] ?? 0,
      createdAt: c.createdAt,
    }));

    return ok(result);
  } catch {
    return err("خطا در دریافت مکالمات", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const senderId = auth.session.user.id;

  try {
    const { conversationId, content } = await req.json();

    if (!content?.trim()) return err("متن پیام خالی است");

    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: senderId },
    });
    if (!participant) return err("دسترسی ندارید", 403);

    const message = await prisma.message.create({
      data: { conversationId, senderId, content: content.trim() },
      include: { sender: { select: { name: true, image: true } } },
    });

    return ok({ message }, 201);
  } catch {
    return err("خطا در ارسال پیام", 500);
  }
}
