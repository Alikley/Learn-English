"use client";

import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Loader2, MessagesSquare, AlertCircle, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useChat } from "@/app/hook/chat/useChat";
import ChatComposer from "@/app/components/chat/ChatComposer";
import ChatMessageCard from "@/app/components/chat/ChatMessageCard";
import ChatPagination from "@/app/components/chat/ChatPagination";

// ========================================
// صفحه چت کاربران (v1.0.3.0 — گام ۴ و ۵ / v1.0.3.1 — رفع باگ ذخیره پیام)
// کاربرها با هم گفتگو می‌کنند:
//  - پیام‌ها باکسی + لایک/دیسلایک + «جواب دادن» (پاسخ تورفته زیر همان باکس)
//  - صفحه‌بندی (۱۰ پیام ریشه در هر صفحه)
//  - انیمیشن ورود پیام‌ها، bump شمارنده لایک، toast خطا
// معماری طبق الگوی سایت: API اختصاصی (/api/chat) + هوک (useChat)
// + کامپوننت (components/chat) + دارک‌مود (dark:) + تغییر زبان (tr)
// نکته: چت عمداً در روزهای متوالی (استریک) حساب نمی‌شود
// ========================================

export default function ChatPage() {
  const { tr, dir } = useLanguage();
  const {
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
  } = useChat();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {tr("چت کاربران", "Community Chat")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tr(
              "با بقیه کاربرها گفتگو کن — سؤال بپرس، تجربه بگذار!",
              "Talk with other users — ask questions, share tips!",
            )}
          </p>
        </div>
        {total > 0 && (
          <span className="ms-auto shrink-0 text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
            {tr(`${total} پیام`, `${total} messages`)}
          </span>
        )}
      </div>

      {/* ================= فرم ارسال پیام ================= */}
      <div className="mb-5">
        <ChatComposer
          sending={sending}
          onSubmit={(content) => send(content)}
          placeholder={tr("پیامت را بنویس...", "Write your message...")}
        />
      </div>

      {/* ================= لیست پیام‌ها ================= */}
      {loading && messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {tr("در حال بارگذاری پیام‌ها...", "Loading messages...")}
          </p>
        </div>
      ) : messages.length === 0 ? (
        /* حالت خالی — اولین پیام را تو بفرست */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl"
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"
          >
            <MessagesSquare className="h-8 w-8 text-blue-400" />
          </motion.div>
          <p className="font-bold text-slate-700 dark:text-slate-200">
            {tr("هنوز پیامی نیست — اولین نفر باش!", "No messages yet — be the first!")}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tr(
              "پیامت را در کادر بالا بنویس و دکمه ارسال را بزن",
              "Write your message in the box above and hit send",
            )}
          </p>
        </motion.div>
      ) : (
        <>
          <div className={`space-y-4 ${loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}`}>
            <AnimatePresence mode="popLayout">
              {messages.map((m) => (
                <ChatMessageCard
                  key={m.id}
                  message={m}
                  sending={sending}
                  onReply={(parentId, content) => send(content, parentId)}
                  onReact={react}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* صفحه‌بندی — پیام‌ها بعداً زیاد می‌شوند */}
          <ChatPagination
            page={page}
            totalPages={totalPages}
            onChange={goToPage}
            disabled={loading}
          />
        </>
      )}

      {/* ================= toast خطا (مثل محدودیت ارسال سریع) ================= */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 w-[92%] max-w-md"
          >
            <div className="flex items-center gap-2.5 bg-red-600 text-white rounded-xl px-4 py-3 shadow-2xl shadow-red-500/20">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm leading-6">{error}</p>
              <button
                type="button"
                onClick={dismissError}
                aria-label={tr("بستن", "Close")}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
