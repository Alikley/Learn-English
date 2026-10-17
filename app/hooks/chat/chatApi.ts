// ========================================
// لایه API چت کاربران (v1.0.3.0 — گام ۵)
// همهٔ درخواست‌های شبکهٔ چت از این فایل می‌گذرند —
// کامپوننت‌ها هرگز مستقیم fetch نمی‌زنند
// ========================================
import type {
  ChatListResult,
  ChatMessageView,
  ChatReactionResult,
  ChatReactionType,
} from "@/types/chat";

/** استخراج پیام خطای فارسی سرور؛ اگر نبود متن جایگزین */
async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown };
    if (data && typeof data.error === "string" && data.error) return data.error;
  } catch {
    /* بدنه JSON نبود — بی‌خیال */
  }
  return fallback;
}

/** یک صفحه از پیام‌های چت (پیام‌های ریشه + پاسخ‌ها + واکنش‌ها) */
export async function fetchChatPage(page: number): Promise<ChatListResult> {
  const res = await fetch(`/api/chat?page=${page}`);
  if (!res.ok) throw new Error(await parseError(res, "دریافت پیام‌ها ناموفق بود"));
  return (await res.json()) as ChatListResult;
}

/** ارسال پیام جدید یا پاسخ (parentId = شناسه پیام ریشه) */
export async function sendChatMessage(
  content: string,
  parentId?: string,
): Promise<ChatMessageView> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, parentId: parentId ?? undefined }),
  });
  if (!res.ok) throw new Error(await parseError(res, "ارسال پیام ناموفق بود"));
  return (await res.json()) as ChatMessageView;
}

/** ثبت/تغییر/حذف واکنش (1 = لایک، -1 = دیسلایک، 0 = حذف) */
export async function setChatReaction(
  messageId: string,
  type: ChatReactionType,
): Promise<ChatReactionResult> {
  const res = await fetch(`/api/chat/${messageId}/reaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) throw new Error(await parseError(res, "ثبت واکنش ناموفق بود"));
  return (await res.json()) as ChatReactionResult;
}
