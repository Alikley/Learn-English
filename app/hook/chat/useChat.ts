"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchChatPage,
  sendChatMessage,
  setChatReaction,
} from "./chatApi";
import type {
  ChatMessageView,
  ChatReactionType,
  ChatReplyView,
} from "@/types/chat";

// ========================================
// هوک چت کاربران (v1.0.3.0 — گام ۵)
// وضعیت کامل صفحهٔ چت اینجاست؛ کامپوننت‌ها فقط رندر می‌کنند:
//  - صفحه‌بندی (goToPage)
//  - ارسال پیام/پاسخ (send) — بعد از ارسال، لیست خودکار رفرش می‌شود
//  - لایک/دیسلایک (react) — آپدیت خوش‌بینانه + اصلاح از سرور
//  - خطاها (error) با مخفی‌شدن خودکار
// ========================================

/** اعمال واکنش جدید روی یک پیام (آپدیت خوش‌بینانه) */
function applyOptimisticReaction<T extends ChatReplyView>(m: T, next: ChatReactionType): T {
  const prev = m.myReaction;
  let likes = m.likes;
  let dislikes = m.dislikes;
  if (prev === 1) likes -= 1;
  if (prev === -1) dislikes -= 1;
  if (next === 1) likes += 1;
  if (next === -1) dislikes += 1;
  return { ...m, likes, dislikes, myReaction: next };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // مخفی‌شدن خودکار پیام خطا
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const load = useCallback(async (target: number) => {
    setLoading(true);
    try {
      const data = await fetchChatPage(target);
      setMessages(data.messages);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای نامشخص");
    } finally {
      setLoading(false);
    }
  }, []);

  // بارگذاری صفحهٔ اول
  useEffect(() => {
    // الگوی تاخیری سایت — سازگار با React Compiler
    const t = setTimeout(() => void load(1), 0);
    return () => clearTimeout(t);
  }, [load]);

  /** رفتن به صفحهٔ دیگر (سرور صفحهٔ خارج از بازه را clamp می‌کند) */
  const goToPage = useCallback(
    (p: number) => {
      if (loading) return;
      void load(p);
    },
    [load, loading],
  );

  /** ارسال پیام جدید (بدون parentId) یا پاسخ به یک باکس (با parentId) — موفقیت را برمی‌گرداند */
  const send = useCallback(
    async (content: string, parentId?: string): Promise<boolean> => {
      if (sending) return false;
      setSending(true);
      try {
        await sendChatMessage(content, parentId);
        if (parentId) {
          // پاسخ → همان صفحه رفرش می‌شود تا زیر باکس خودش ظاهر شود
          await load(page);
        } else {
          // پیام جدید → صفحهٔ اول؛ پیام کاربر بالای لیست دیده می‌شود
          await load(1);
        }
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "ارسال پیام ناموفق بود");
        return false;
      } finally {
        setSending(false);
      }
    },
    [load, page, sending],
  );

  /** لایک/دیسلایک/حذف واکنش — روی پیام ریشه یا هر پاسخ */
  const react = useCallback(
    async (messageId: string, type: ChatReactionType) => {
      // آپدیت خوش‌بینانه (هم روی ریشه‌ها هم روی پاسخ‌ها)
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) return applyOptimisticReaction(m, type);
          const replies = m.replies.map((r) =>
            r.id === messageId ? applyOptimisticReaction(r, type) : r,
          );
          return { ...m, replies };
        }),
      );

      try {
        const res = await setChatReaction(messageId, type);
        // مقدار قطعی سرور جایگزین می‌شود
        setMessages((prev) =>
          prev.map((m) => {
            const fix = (x: ChatReplyView): ChatReplyView =>
              x.id === messageId
                ? { ...x, likes: res.likes, dislikes: res.dislikes, myReaction: res.myReaction }
                : x;
            const next = { ...fix(m), replies: m.replies.map(fix) };
            return next;
          }),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "ثبت واکنش ناموفق بود");
        // بازگشت به مقدار واقعی سرور
        await load(page);
      }
    },
    [load, page],
  );

  const dismissError = useCallback(() => setError(null), []);

  return {
    messages,
    page,
    totalPages,
    total,
    loading,
    sending,
    error,
    goToPage,
    send,
    react,
    dismissError,
  };
}
