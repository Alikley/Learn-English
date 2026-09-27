"use client";

import { useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { Send, Loader2, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { CHAT_MAX_CONTENT } from "@/types/chat";

// ========================================
// فرم ارسال پیام چت (v1.0.3.0 — گام ۴)
// دو حالت دارد:
//  - حالت اصلی: باکس بزرگ ارسال پیام جدید (بالای لیست)
//  - حالت پاسخ (compact): فرم کوچک زیر همان باکس + دکمه لغو
// Enter = ارسال | Shift+Enter = خط جدید | شمارندهٔ کاراکتر
// ========================================

export default function ChatComposer({
  sending,
  onSubmit,
  placeholder,
  compact = false,
  autoFocus = false,
  onCancel,
}: {
  sending: boolean;
  /** محتوا را می‌فرستد و موفقیت را برمی‌گرداند (false → متن فرم پاک نمی‌شود) */
  onSubmit: (content: string) => Promise<boolean>;
  placeholder?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const { tr } = useLanguage();
  const [value, setValue] = useState("");

  const canSend = value.trim().length > 0 && !sending;

  const submit = async () => {
    const text = value.trim();
    if (!text || sending) return;
    const success = await onSubmit(text);
    // فقط بعد از ارسال موفق پاک شود — خطا (مثل محدودیت سرعت) متن را نگه می‌دارد
    if (success) setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const nearLimit = value.length > CHAT_MAX_CONTENT - 100;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-2xl transition-colors ${
        compact
          ? "border-slate-200 dark:border-slate-700"
          : "border-slate-100 dark:border-slate-800 shadow-sm"
      }`}
    >
      <div className="flex items-end gap-2 p-2.5">
        <textarea
          dir="auto"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, CHAT_MAX_CONTENT + 50))}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          rows={compact ? 2 : 3}
          placeholder={placeholder ?? tr("پیامت را بنویس...", "Write your message...")}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-7 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
        />
        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
          {compact && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label={tr("لغو پاسخ", "Cancel reply")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
          <motion.button
            type="button"
            onClick={() => void submit()}
            disabled={!canSend}
            whileTap={canSend ? { scale: 0.88 } : undefined}
            aria-label={tr("ارسال", "Send")}
            className={[
              "h-9 rounded-xl flex items-center gap-1.5 px-3.5 text-sm font-bold transition-colors",
              canSend
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed",
            ].join(" ")}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 rtl:-scale-x-100" />
            )}
            <span className="hidden sm:inline">{tr("ارسال", "Send")}</span>
          </motion.button>
        </div>
      </div>

      {/* شمارنده — فقط نزدیک سقف نشان داده می‌شود */}
      {(nearLimit || compact) && value.length > 0 && (
        <div className="px-4 pb-2 text-end">
          <span
            className={`text-[11px] ${
              value.length > CHAT_MAX_CONTENT
                ? "text-red-500 font-bold"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {value.length}/{CHAT_MAX_CONTENT}
          </span>
        </div>
      )}
    </div>
  );
}
