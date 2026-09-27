"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ========================================
// هوک چت انجمنی (v1.0.3.0 — گام ۴ و ۵)
// - GET  صفحه‌بندی‌شده /api/chat?page=N (صفحه ۱ = تازه‌ترین‌ها)
// - POST پیام جدید یا پاسخ (optimistic — پیام همان لحظه ظاهر می‌شود)
// - POST واکنش لایک/دیسلایک (optimistic — شمارنده همان لحظه عوض می‌شود)
// فقط منطق — رندر در app/components/chat
// ========================================

export type ChatAuthor = { name: string; image: string | null };

export type ChatReply = {
  id: string;
  content: string;
  createdAt: string;
  author: ChatAuthor;
  likes: number;
  dislikes: number;
  myReaction: 1 | -1 | 0;
};

export type ChatMessageItem = ChatReply & {
  replies: ChatReply[];
  replyCount: number;
};

export type ChatPageData = {
  messages: ChatMessageItem[];
  page: number;
  totalPages: number;
  total: number;
};

export function useChat() {
  const [data, setData] = useState<ChatPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  /** پیامی که کاربر دارد به آن پاسخ می‌نویسد (id ریشه) */
  const [replyingTo, setReplyingTo] = useState<ChatMessageItem | null>(null);
  /** آخرین پیام ارسال‌شده (روی صفحه ۱ اسکرول شود) */
  const [lastSentId, setLastSentId] = useState<string | null>(null);
  const pageRef = useRef(1);

  // ---- بارگذاری یک صفحه ----
  const load = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat?page=${page}`, { cache: "no-store" });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(d?.error ?? "خطا در دریافت پیام‌ها");
        return;
      }
      const d = (await res.json()) as ChatPageData;
      pageRef.current = d.page;
      setData(d);
    } catch {
      setError("ارتباط برقرار نشد — اینترنت را چک کن");
    } finally {
      setLoading(false);
    }
  }, []);

  // اولین بار — صفحه ۱ (تازه‌ترین‌ها)
  useEffect(() => {
    const id = setTimeout(() => void load(1), 0);
    return () => clearTimeout(id);
  }, [load]);

  // ---- ارسال پیام / پاسخ (optimistic) ----
  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || sending) return false;
      setSending(true);
      setError(null);

      const parentId = replyingTo?.id ?? null;
      const tempId = `temp-${Date.now()}`;

      // به‌روزرسانی خوش‌بینانه — پیام همان لحظه در لیست می‌نشیند
      setData((prev) => {
        if (!prev) return prev;
        const optimistic: ChatMessageItem = {
          id: tempId,
          content: text,
          createdAt: new Date().toISOString(),
          author: { name: "…", image: null },
          likes: 0,
          dislikes: 0,
          myReaction: 0,
          replies: [],
          replyCount: 0,
        };
        if (parentId) {
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === parentId
                ? {
                    ...m,
                    replies: [
                      ...m.replies,
                      {
                        id: tempId,
                        content: text,
                        createdAt: optimistic.createdAt,
                        author: optimistic.author,
                        likes: 0,
                        dislikes: 0,
                        myReaction: 0 as const,
                      },
                    ],
                    replyCount: m.replyCount + 1,
                  }
                : m,
            ),
          };
        }
        return { ...prev, messages: [...prev.messages, optimistic] };
      });
      setLastSentId(tempId);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, parentId }),
        });
        const d = (await res.json().catch(() => null)) as
          | { message?: ChatMessageItem; error?: string }
          | null;

        if (!res.ok || !d?.message) {
          // برگرداندن حالت قبل + پیام خطا
          setError(d?.error ?? "ارسال پیام ناموفق بود");
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  messages: prev.messages.filter((m) => m.id !== tempId).map((m) => ({
                    ...m,
                    replies: m.replies.filter((r) => r.id !== tempId),
                  })),
                }
              : prev,
          );
          return false;
        }

        // جایگزینی پیام موقت با نسخه سرور
        const real = d.message;
        setData((prev) => {
          if (!prev) return prev;
          if (parentId) {
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === parentId
                  ? {
                      ...m,
                      replies: m.replies.map((r) =>
                        r.id === tempId
                          ? {
                              id: real.id,
                              content: real.content,
                              createdAt: real.createdAt,
                              author: real.author,
                              likes: 0,
                              dislikes: 0,
                              myReaction: 0 as const,
                            }
                          : r,
                      ),
                    }
                  : m,
              ),
            };
          }
          return {
            ...prev,
            messages: prev.messages.map((m) => (m.id === tempId ? { ...m, ...real, replies: [] } : m)),
          };
        });
        setLastSentId(real.id);
        setReplyingTo(null);
        return true;
      } catch {
        setError("ارتباط برقرار نشد — پیام ارسال نشد");
        setData((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.filter((m) => m.id !== tempId).map((m) => ({
                  ...m,
                  replies: m.replies.filter((r) => r.id !== tempId),
                })),
              }
            : prev,
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [sending, replyingTo],
  );

  // ---- واکنش لایک/دیسلایک (optimistic) ----
  const react = useCallback(
    async (targetId: string, value: 1 | -1) => {
      if (!data) return;

      // پیدا کردن آیتم هدف (پیام ریشه یا پاسخ) + وضعیت فعلی واکنش‌ها
      let before = { likes: 0, dislikes: 0, myReaction: 0 as 1 | -1 | 0 };
      for (const m of data.messages) {
        if (m.id === targetId) {
          before = { likes: m.likes, dislikes: m.dislikes, myReaction: m.myReaction };
          break;
        }
        const r = m.replies.find((x) => x.id === targetId);
        if (r) {
          before = { likes: r.likes, dislikes: r.dislikes, myReaction: r.myReaction };
          break;
        }
      }

      // واکنش بعدی سمت کلاینت (toggle — دوباره زدن همان دکمه = برداشتن)
      const nextValue = before.myReaction === value ? 0 : value;
      const after = {
        likes:
          before.likes -
          (before.myReaction === 1 ? 1 : 0) +
          (nextValue === 1 ? 1 : 0),
        dislikes:
          before.dislikes -
          (before.myReaction === -1 ? 1 : 0) +
          (nextValue === -1 ? 1 : 0),
        myReaction: nextValue as 1 | -1 | 0,
      };

      // به‌روزرسانی خوش‌بینانه
      setData((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) => {
                if (m.id === targetId) return { ...m, ...after };
                return {
                  ...m,
                  replies: m.replies.map((r) =>
                    r.id === targetId ? { ...r, ...after } : r,
                  ),
                };
              }),
            }
          : prev,
      );

      try {
        const res = await fetch(`/api/chat/${targetId}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: nextValue }),
        });
        if (!res.ok) throw new Error("failed");
        const d = (await res.json()) as typeof after;
        // مقدار قطعی سرور
        setData((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((m) => {
                  if (m.id === targetId) return { ...m, ...d };
                  return {
                    ...m,
                    replies: m.replies.map((r) =>
                      r.id === targetId ? { ...r, ...d } : r,
                    ),
                  };
                }),
              }
            : prev,
        );
      } catch {
        // برگرداندن حالت قبل
        setData((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((m) => {
                  if (m.id === targetId) return { ...m, ...before };
                  return {
                    ...m,
                    replies: m.replies.map((r) =>
                      r.id === targetId ? { ...r, ...before } : r,
                    ),
                  };
                }),
              }
            : prev,
        );
      }
    },
    [data],
  );

  const goToPage = useCallback(
    (page: number) => {
      setReplyingTo(null);
      void load(page);
    },
    [load],
  );

  const refresh = useCallback(() => void load(pageRef.current), [load]);

  return {
    data,
    loading,
    error,
    sending,
    replyingTo,
    lastSentId,
    setReplyingTo,
    send,
    react,
    goToPage,
    refresh,
  };
}
