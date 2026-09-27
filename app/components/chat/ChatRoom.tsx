"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MessageCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useChat } from "@/app/hook/chat/useChat";
import ChatMessageCard from "./ChatMessageCard";
import ChatComposer from "./ChatComposer";
import ChatPagination from "./ChatPagination";

// ========================================
// اتاق چت انجمنی (v1.0.3.0 — گام ۴ و ۵)
// ترکیب: هدر + لیست پیام‌ها + صفحه‌بندی + جعبه نوشتن
// منطق در useChat — اینجا فقط رندر
// ========================================

export default function ChatRoom() {
  const { tr, dir, lang } = useLanguage();
  const {
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
  } = useChat();

  const listRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<string | null>(null);

  // اسکرول به آخرین پیام ارسال‌شده / پایین لیست بعد از هر بارگذاری
  useEffect(() => {
    if (!data) return;
    if (lastSentRef.current !== lastSentId) {
      lastSentRef.current = lastSentId;
      const el = listRef.current?.querySelector(`[data-id="${lastSentId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // بارگذاری عادی → پایین لیست
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [data, lastSentId]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-blue-500 dark:text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            {tr("پیام‌ها", "Messages")}
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 truncate">
            {data
              ? tr(
                  `${data.total} پیام در گفتگوی گروهی`,
                  `${data.total} messages in the group chat`,
                )
              : tr("با بقیه زبان‌آموزها گفتگو کن", "Chat with fellow learners")}
          </p>
        </div>
        <button
          onClick={refresh}
          title={tr("تازه‌سازی", "Refresh")}
          className="shrink-0 w-10 h-10 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/15 transition-all active:scale-90"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {/* ================= خطا ================= */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={refresh}
            className="shrink-0 font-bold hover:underline"
          >
            {tr("تلاش دوباره", "Retry")}
          </button>
        </motion.div>
      )}

      {/* ================= لیست پیام‌ها ================= */}
      <div
        ref={listRef}
        className="space-y-3 max-h-[62vh] overflow-y-auto pe-1 mb-3 scroll-smooth"
      >
        {loading && !data ? (
          // بارگذاری اولیه
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-3.5 w-28 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))
        ) : data && data.messages.length === 0 ? (
          // خالی — اولین پیام را تو بفرست
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-10 text-center"
          >
            <div className="text-5xl mb-3">💬</div>
            <p className="font-bold text-slate-600 dark:text-slate-300">
              {tr("هنوز پیامی نیست!", "No messages yet!")}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {tr("اولین نفر باش و سلام کن 👋", "Be the first to say hi 👋")}
            </p>
          </motion.div>
        ) : (
          data?.messages.map((m) => (
            <div key={m.id} data-id={m.id}>
              <ChatMessageCard
                message={m}
                onReact={react}
                onReply={setReplyingTo}
                isReplyTarget={replyingTo?.id === m.id}
                highlight={lastSentId === m.id}
              />
            </div>
          ))
        )}
      </div>

      {/* ================= صفحه‌بندی ================= */}
      {data && (
        <ChatPagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={goToPage}
          disabled={loading}
        />
      )}

      {/* ================= جعبه نوشتن ================= */}
      <div className="mt-3">
        <ChatComposer
          sending={sending}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSend={send}
        />
        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          {tr(
            "به دیگران احترام بگذار — پیام‌های بی‌اداب حذف می‌شوند",
            "Be respectful — inappropriate messages will be removed",
          )}
          {lang === "fa" ? " · نسخه ۱.۰.۳.۰" : " · v1.0.3.0"}
        </p>
      </div>
    </div>
  );
}
