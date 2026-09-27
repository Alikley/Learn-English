import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

// ========================================
// چت انجمنی (v1.0.3.0 — گام ۴ و ۵)
//
// GET  /api/chat?page=1   → پیام‌های ریشه صفحه‌بندی‌شده + پاسخ‌ها + واکنش‌ها
// POST /api/chat          → پیام جدید یا پاسخ  body: { content, parentId? }
//
// ساختار پاسخ GET:
// {
//   messages: [ { id, content, createdAt, author, likes, dislikes,
//                 myReaction, replies: [...], replyCount } ],
//   page, totalPages, total
// }
// صفحه ۱ = تازه‌ترین پیام‌ها؛ هر صفحه ۲۰ پیام ریشه.
// پیام‌های هر صفحه از قدیم به جدید چیده می‌شوند تا مثل چت خوانده شوند.
// ========================================

const PAGE_SIZE = 20;
const MAX_CONTENT = 1000;
/// سقف پاسخ‌هایی که همراه هر صفحه برمی‌گردند
const REPLIES_TAKE = 50;

type ReactionRow = { value: number; userId: string };

type MessageRow = {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string | null; nickname: string | null; image: string | null };
  reactions: ReactionRow[];
  replies?: MessageRow[];
  _count?: { replies: number };
};

function authorOf(row: {
  user: { name: string | null; nickname: string | null; image: string | null };
}) {
  return {
    name: row.user.nickname?.trim() || row.user.name?.trim() || "کاربر",
    image: row.user.image,
  };
}

function summarizeReactions(reactions: ReactionRow[], userId: string) {
  let likes = 0;
  let dislikes = 0;
  let myReaction: 1 | -1 | 0 = 0;
  for (const r of reactions) {
    if (r.value === 1) likes++;
    else if (r.value === -1) dislikes++;
    if (r.userId === userId) myReaction = r.value === 1 ? 1 : -1;
  }
  return { likes, dislikes, myReaction };
}

function toMessageDto(row: MessageRow, userId: string) {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    author: authorOf(row),
    ...summarizeReactions(row.reactions, userId),
    replies: (row.replies ?? []).map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      author: authorOf(r),
      ...summarizeReactions(r.reactions, userId),
    })),
    replyCount: row._count?.replies ?? row.replies?.length ?? 0,
  };
}

const messageInclude = {
  user: { select: { name: true, nickname: true, image: true } },
  reactions: { select: { value: true, userId: true } },
  replies: {
    orderBy: { createdAt: "asc" },
    take: REPLIES_TAKE,
    include: {
      user: { select: { name: true, nickname: true, image: true } },
      reactions: { select: { value: true, userId: true } },
    },
  },
  _count: { select: { replies: true } },
} satisfies Prisma.ChatMessageInclude;

// ---------------- GET — فهرست صفحه‌بندی‌شده ----------------
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const url = new URL(req.url);
  const pageParam = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

  try {
    const total = await prisma.chatMessage.count({
      where: { parentId: null },
    });
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // صفحه ۱ = تازه‌ترین‌ها → از انتها به عقب می‌شماریم
    const safePage = Math.min(page, totalPages);
    const skip = Math.max(0, total - safePage * PAGE_SIZE);
    const take = Math.min(PAGE_SIZE, total - skip);

    const rows = await prisma.chatMessage.findMany({
      where: { parentId: null },
      orderBy: { createdAt: "asc" },
      skip,
      take: Math.max(take, 0) || PAGE_SIZE,
      include: messageInclude,
    });

    return ok({
      messages: rows.map((r) => toMessageDto(r as MessageRow, userId)),
      page: safePage,
      totalPages,
      total,
    });
  } catch {
    return err("خطای سرور — بعداً تلاش کنید", 500);
  }
}

// ---------------- POST — پیام جدید یا پاسخ ----------------
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  let body: { content?: unknown; parentId?: unknown } | null = null;
  try {
    body = (await req.json()) as { content?: unknown; parentId?: unknown };
  } catch {
    return err("درخواست نامعتبر است");
  }

  const content =
    typeof body?.content === "string" ? body.content.trim().slice(0, MAX_CONTENT) : "";
  if (!content) return err("متن پیام خالی است");

  try {
    // پاسخ؟ → والد باید وجود داشته باشد؛ پاسخِ به پاسخ، به ریشه تبدیل می‌شود
    let parentId: string | null = null;
    if (typeof body?.parentId === "string" && body.parentId) {
      const target = await prisma.chatMessage.findUnique({
        where: { id: body.parentId },
        select: { id: true, parentId: true },
      });
      if (!target) return err("پیام موردنظر یافت نشد", 404);
      parentId = target.parentId ?? target.id;
    }

    // ضد اسپم: بیش از ۲۰ پیام در ۱ دقیقه نپذیر
    const recent = await prisma.chatMessage.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 60_000) } },
    });
    if (recent >= 20)
      return err("خیلی سریع پیام می‌فرستی — کمی صبر کن", 429);

    const created = await prisma.chatMessage.create({
      data: { userId, content, parentId },
      include: {
        user: { select: { name: true, nickname: true, image: true } },
        reactions: { select: { value: true, userId: true } },
      },
    });

    return ok(
      {
        message: {
          id: created.id,
          content: created.content,
          createdAt: created.createdAt.toISOString(),
          author: authorOf(created),
          likes: 0,
          dislikes: 0,
          myReaction: 0 as 1 | -1 | 0,
          replies: [],
          replyCount: 0,
        },
      },
      201,
    );
  } catch {
    return err("خطای سرور — بعداً تلاش کنید", 500);
  }
}
