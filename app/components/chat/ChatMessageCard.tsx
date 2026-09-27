"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, ThumbsDown, MessageSquareReply } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import ChatComposer from "./ChatComposer";
import type { ChatMessageView, ChatReactionType, ChatReplyView } from "@/types/chat";

// ========================================
// باکس پیام چت (v1.0.3.0 — گام ۴)
// هر باکس: آواتار + نام + زمان + متن + اکشن‌ها
//  - لایک / دیسلایک (با شمارنده و حالت فعال)
//  - «جواب دادن» → فرم پاسخ زیر همان باکس باز می‌شود
//  - پاسخ‌ها تورفته (خط عمودی + فاصله) زیر همان باکس نمایش داده می‌شوند
// دارک‌مود و تغییر زبان طبق الگوی سایت (dark: + tr)
// ========================================

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-600",
  "bg-indigo-500",
  "bg-teal-500",
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initialOf(name: string): string {
  const clean = name.trim();
  return clean ? clean[0].toUpperCase() : "؟";
}

/** زمان نسبی — دو زبانه */
function timeAgo(
  iso: string,
  tr: (fa: string, en: string) => string,
): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return tr("همین حالا", "just now");
  const min = Math.floor(sec / 60);
  if (min < 60) return tr(`${min} دقیقه پیش`, `${min}m ago`);
  const hr = Math.floor(min / 60);
  if (hr < 24) return tr(`${hr} ساعت پیش`, `${hr}h ago`);
  const day = Math.floor(hr / 24);
  if (day === 1) return tr("دیروز", "yesterday");
  if (day < 7) return tr(`${day} روز پیش`, `${day}d ago`);
  const d = new Date(iso);
  return tr(d.toLocaleDateString("fa-IR"), d.toLocaleDateString("en-US"));
}

// ---------- دکمه واکنش (لایک/دیسلایک) ----------
function ReactionButton({
  active,
  activeClass,
  count,
  icon,
  label,
  disabled,
  onClick,
}: {
  active: boolean;
  activeClass: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = icon;
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.82 }}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      className={[
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors select-none",
        active
          ? activeClass
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {/* bump انیمیشنی عدد با هر تغییر */}
      <motion.span
        key={count}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 400 }}
        className="min-w-3 text-center"
      >
        {count}
      </motion.span>
    </motion.button>
  );
}

// ---------- یک پاسخ تورفته ----------
function ReplyRow({
  reply,
  onReact,
}: {
  reply: ChatReplyView;
  onReact: (messageId: string, type: ChatReactionType) => void;
}) {
  const { tr } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5"
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full ${avatarColor(reply.authorName)} text-white text-[10px] flex items-center justify-center font-bold shrink-0`}
        >
          {initialOf(reply.authorName)}
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
          {reply.authorName}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
          {timeAgo(reply.createdAt, tr)}
        </span>
      </div>

      <p
        dir="auto"
        className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words"
      >
        {reply.content}
      </p>

      <div className="mt-1.5 flex items-center gap-1">
        <ReactionButton
          active={reply.myReaction === 1}
          activeClass="bg-blue-600 text-white"
          count={reply.likes}
          icon={ThumbsUp}
          label={tr("لایک پاسخ", "Like reply")}
          onClick={() => onReact(reply.id, reply.myReaction === 1 ? 0 : 1)}
        />
        <ReactionButton
          active={reply.myReaction === -1}
          activeClass="bg-red-500 text-white"
          count={reply.dislikes}
          icon={ThumbsDown}
          label={tr("دیسلایک پاسخ", "Dislike reply")}
          onClick={() => onReact(reply.id, reply.myReaction === -1 ? 0 : -1)}
        />
      </div>
    </motion.div>
  );
}

// ---------- باکس پیام ریشه ----------
export default function ChatMessageCard({
  message,
  sending,
  onReply,
  onReact,
}: {
  message: ChatMessageView;
  sending: boolean;
  /** پاسخ به این باکس — موفقیت را برمی‌گرداند */
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onReact: (messageId: string, type: ChatReactionType) => void;
}) {
  const { tr } = useLanguage();
  const [replying, setReplying] = useState(false);

  const handleReply = async (content: string) => {
    const success = await onReply(message.id, content);
    if (success) setReplying(false);
    return success;
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex gap-3">
        {/* آواتار */}
        <div
          className={`w-10 h-10 rounded-full ${avatarColor(message.authorName)} text-white flex items-center justify-center font-bold text-sm shrink-0`}
        >
          {initialOf(message.authorName)}
        </div>

        <div className="flex-1 min-w-0">
          {/* نام + زمان */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {message.authorName}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {timeAgo(message.createdAt, tr)}
            </span>
          </div>

          {/* متن پیام — dir=auto تا متن فارسی/انگلیسی درست چیده شود */}
          <p
            dir="auto"
            className="mt-1.5 text-[15px] leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words"
          >
            {message.content}
          </p>

          {/* اکشن‌ها: لایک / دیسلایک / جواب دادن */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <ReactionButton
              active={message.myReaction === 1}
              activeClass="bg-blue-600 text-white"
              count={message.likes}
              icon={ThumbsUp}
              label={tr("لایک", "Like")}
              onClick={() => onReact(message.id, message.myReaction === 1 ? 0 : 1)}
            />
            <ReactionButton
              active={message.myReaction === -1}
              activeClass="bg-red-500 text-white"
              count={message.dislikes}
              icon={ThumbsDown}
              label={tr("دیسلایک", "Dislike")}
              onClick={() => onReact(message.id, message.myReaction === -1 ? 0 : -1)}
            />

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setReplying((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                replying
                  ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <MessageSquareReply className="h-4 w-4" />
              {tr("جواب دادن", "Reply")}
            </motion.button>

            {message.replies.length > 0 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 ms-auto">
                {tr(
                  `${message.replies.length} پاسخ`,
                  `${message.replies.length} ${message.replies.length === 1 ? "reply" : "replies"}`,
                )}
              </span>
            )}
          </div>

          {/* فرم پاسخ — زیر همان باکس باز می‌شود */}
          <AnimatePresence initial={false}>
            {replying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <ChatComposer
                    compact
                    autoFocus
                    sending={sending}
                    onSubmit={handleReply}
                    onCancel={() => setReplying(false)}
                    placeholder={tr("جوابت را بنویس...", "Write your reply...")}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* پاسخ‌ها — تورفته زیر همان باکس (خط عمودی + فاصله از ابتدای سطر) */}
          {message.replies.length > 0 && (
            <div className="mt-3 border-s-2 border-slate-100 dark:border-slate-700/70 ps-3 space-y-2.5">
              {message.replies.map((r) => (
                <ReplyRow key={r.id} reply={r} onReact={onReact} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
