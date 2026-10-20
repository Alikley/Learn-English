import { NextRequest } from "next/server";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { ensureUserRow } from "@/lib/ensure-user";
import type { ChatListResult, ChatReplyView, ChatReactionType } from "@/types/chat";
// v1.0.7.1 (English 1.0.1.14) — پارس query/بدنه با zod به‌جای دستی
import {
  validateQuery,
  validateJson,
  chatPageQuerySchema,
  chatPostSchema,
} from "@/lib/validation";

// ========================================
// چت کاربران (v1.0.3.0 — گام ۴ و ۵ / v1.0.3.1 — رفع باگ FK)
//
// GET  /api/chat?page=1
//   → پیام‌های ریشه (جدیدترین اول، صفحه‌بندی) + پاسخ‌ها (قدیمی اول)
//     + تعداد لایک/دیسلایک + واکنش کاربر جاری
//
// POST /api/chat  body: { content, parentId? }
//   → ارسال پیام جدید یا پاسخ (جواب دادن) به یک باکس
//     parentId همیشه به پیام ریشه وصل می‌شود (پاسخِ پاسخ زیر همان باکس می‌رود)
// ========================================

/** پیام ریشه در هر صفحه */
const PAGE_SIZE = 10;
/** سقف ارسال پیام در پنجرهٔ ضد اسپم */
const RATE_LIMIT_COUNT = 20;
/** پنجرهٔ ضد اسپم — ۱۰ دقیقه */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

type DbUser = { name: string | null; nickname: string | null };

function displayName(u: DbUser | null | undefined): string {
  return (u?.nickname || u?.name || "").trim() || "کاربر";
}

/** گارد: کلاینت Prisma با schema قدیمی generate شده باشد → راهنمای دقیق */
function chatModelGuard() {
  const p = prisma as unknown as Record<string, unknown>;
  if (!p.chatMessage) {
    return err(
      "جدول‌های چت آماده نیست — دستور «npx prisma generate» و بعد «npx prisma migrate deploy» را اجرا کن",
      500,
    );
  }
  return null;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const guard = chatModelGuard();
  if (guard) return guard;

  const uid = auth.session.user.id;
  const qp = validateQuery(req, chatPageQuerySchema);
  if (!qp.ok) return qp.response;
  const requestedPage = qp.data.page;

  const total = await prisma.chatMessage.count({ where: { parentId: null } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages); // صفحهٔ درخواستی خارج از بازه → آخرین صفحه

  const roots = await prisma.chatMessage.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { user: { select: { name: true, nickname: true } } },
  });

  const rootIds = roots.map((m) => m.id);
  const replies = rootIds.length
    ? await prisma.chatMessage.findMany({
        where: { parentId: { in: rootIds } },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, nickname: true } } },
      })
    : [];

  // v1.0.2.2 (English 1.0.2.2) — سطح CEFR نویسنده‌های این صفحه:
  // آخرین نتیجهٔ تعیین سطح هر کاربر → بج رنگی کنار اسم (گام ۲).
  // خطا (مثلاً جدول تعیین سطح هنوز نیست) → همه null → بج مخفی —
  // چت هرگز به خاطر سطح‌ها نمی‌شکند.
  const levelByUser = new Map<string, string>();
  try {
    const authorIds = [...new Set([...roots, ...replies].map((m) => m.userId))];
    if (authorIds.length) {
      const placements = await prisma.placementResult.findMany({
        where: { userId: { in: authorIds } },
        orderBy: { createdAt: "desc" },
        select: { userId: true, cefr: true },
      });
      for (const p of placements) {
        if (!levelByUser.has(p.userId)) levelByUser.set(p.userId, p.cefr);
      }
    }
  } catch {
    /* سطح‌ها خالی می‌مانند */
  }

  // واکنش‌های همهٔ پیام‌های این صفحه → شمارش لایک/دیسلایک + واکنش خودم
  const allIds = [...rootIds, ...replies.map((m) => m.id)];
  const reactions = allIds.length
    ? await prisma.chatReaction.findMany({
        where: { messageId: { in: allIds } },
        select: { messageId: true, userId: true, type: true },
      })
    : [];

  type Agg = { likes: number; dislikes: number; mine: ChatReactionType };
  const aggByMessage = new Map<string, Agg>();
  for (const r of reactions) {
    const agg = aggByMessage.get(r.messageId) ?? { likes: 0, dislikes: 0, mine: 0 };
    if (r.type === 1) agg.likes += 1;
    else if (r.type === -1) agg.dislikes += 1;
    if (r.userId === uid) agg.mine = r.type === 1 ? 1 : -1;
    aggByMessage.set(r.messageId, agg);
  }

  const toView = (
    m: (typeof roots)[number] | (typeof replies)[number],
  ): ChatReplyView => {
    const agg = aggByMessage.get(m.id) ?? { likes: 0, dislikes: 0, mine: 0 as ChatReactionType };
    return {
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      userId: m.userId,
      authorName: displayName(m.user),
      authorLevel: levelByUser.get(m.userId) ?? null,
      likes: agg.likes,
      dislikes: agg.dislikes,
      myReaction: agg.mine,
    };
  };

  const repliesByParent = new Map<string, ChatReplyView[]>();
  for (const r of replies) {
    const list = repliesByParent.get(r.parentId as string) ?? [];
    list.push(toView(r));
    repliesByParent.set(r.parentId as string, list);
  }

  const result: ChatListResult = {
    messages: roots.map((m) => ({
      ...toView(m),
      replies: repliesByParent.get(m.id) ?? [],
    })),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
  };

  return ok(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const guard = chatModelGuard();
  if (guard) return guard;

  const uid = auth.session.user.id;

  const parsed = await validateJson(req, chatPostSchema);
  if (!parsed.ok) return parsed.response;
  const content = parsed.data.content;

  // parentId فقط به پیام ریشه وصل می‌شود (پاسخِ پاسخ → زیر همان باکس)
  let parentId: string | null = null;
  if (parsed.data.parentId) {
    const target = await prisma.chatMessage.findUnique({
      where: { id: parsed.data.parentId },
      select: { id: true, parentId: true },
    });
    if (!target) return err("پیام مورد نظر پیدا نشد", 404);
    parentId = target.parentId ?? target.id;
  }

  // ضد ارسال انفجاری — مثل نسخهٔ 1.0.3.0
  const recent = await prisma.chatMessage.count({
    where: {
      userId: uid,
      createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) },
    },
  });
  if (recent >= RATE_LIMIT_COUNT)
    return err("خیلی سریع پیام می‌فرستی — کمی صبر کن", 429);

  // ✅ v1.0.3.1 — رفع باگ «پیام ذخیره نمی‌شود / صفحه خالی می‌ماند»:
  // اگر رکورد کاربر در دیتابیس نباشد (سشنِ قدیمی بعد از بازسازی دیتابیس)،
  // INSERT با خطای Foreign Key رد می‌شد؛ اینجا وجود رکورد تضمین می‌شود.
  await ensureUserRow(auth.session);

  const created = await prisma.chatMessage.create({
    data: { userId: uid, parentId, content },
    include: { user: { select: { name: true, nickname: true } } },
  });

  // v1.0.2.2 — سطح خود کاربر برای بج کنار اسم پیام تازه (گام ۲)
  let authorLevel: string | null = null;
  try {
    const mine = await prisma.placementResult.findFirst({
      where: { userId: uid },
      orderBy: { createdAt: "desc" },
      select: { cefr: true },
    });
    authorLevel = mine?.cefr ?? null;
  } catch {
    /* بدون بج */
  }

  return ok(
    {
      id: created.id,
      content: created.content,
      createdAt: created.createdAt.toISOString(),
      userId: created.userId,
      authorName: displayName(created.user),
      authorLevel,
      likes: 0,
      dislikes: 0,
      myReaction: 0,
      replies: [],
    },
    201,
  );
}
