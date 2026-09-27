"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, CornerDownRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { ChatMessageItem } from "@/app/hook/chat/useChat";

// ========================================
// جعبه نوشتن پیام چت (v1.0.3.0 — گام ۴)
// - حالت پاسخ: نوار «در پاسخ به …» + دکمه لغو
// - Enter = ارسال / Shift+Enter = خط جدید
// - شمارنده کاراکتر (سقف ۱۰۰۰)
// ========================================

const MAX = 1000;

export default function ChatComposer({
  sending,
  replyingTo,
  onCancelReply,
  onSend,
}: {
  sending: boolean;
  replyingTo: ChatMessageItem | null;
  onCancelReply: () => void;
  onSend: (content: string) => Promise<boolean>;
}) {
  const { tr } = useLanguage();
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // وقتی حالت پاسخ باز شد، فوکوس بده
  useEffect(() => {
    if (replyingTo) taRef.current?.focus();
  }, [replyingTo]);

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    const success = await onSend(value);
    if (success) setText("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-3 shadow-sm">
      {/* ---- نوار «در پاسخ به» ---- */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 px-3 py-2 text-xs text-blue-600 dark:text-blue-300">
              <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 truncate">
                {tr("در پاسخ به", "Replying to")}{" "}
                <b>{replyingTo.author.name}</b>
                {replyingTo.content.length > 40
                  ? `: ${replyingTo.content.slice(0, 40)}…`
                  : `: ${replyingTo.content}`}
              </span>
              <button
                onClick={onCancelReply}
                className="shrink-0 rounded-full p-1 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                title={tr("لغو پاسخ", "Cancel reply")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- ناحیه نوشتن ---- */}
      <div className="flex items-end gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={2}
          placeholder={tr(
            "پیامت را بنویس… (Shift+Enter = خط جدید)",
            "Type your message… (Shift+Enter for new line)",
          )}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500/50 focus:border-blue-300 dark:focus:border-blue-500/50 transition-all"
        />

        {/* دکمه ارسال */}
        <motion.button
          type="button"
          onClick={() => void submit()}
          disabled={!text.trim() || sending}
          whileTap={text.trim() && !sending ? { scale: 0.9 } : undefined}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            !text.trim() || sending
              ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200/60 dark:shadow-blue-900/40"
          }`}
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {tr("ارسال…", "Sending…")}
            </span>
          ) : (
            <>
              <Send className="w-4 h-4 rtl:-scale-x-100" />
              <span className="hidden sm:inline">{tr("ارسال", "Send")}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* ---- شمارنده ---- */}
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
        <span>{tr("Enter = ارسال", "Enter = send")}</span>
        <span className={text.length >= MAX ? "text-red-400" : undefined}>
          {text.length}/{MAX}
        </span>
      </div>
    </div>
  );
}
