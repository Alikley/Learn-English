"use client";

import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown, CornerDownRight, MessageCircle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { ChatAuthor, ChatMessageItem, ChatReply } from "@/app/hook/chat/useChat";

// ========================================
// کارت پیام چت (v1.0.3.0 — گام ۴)
// باکس دیسکوردی: آواتار + نام + زمان + متن + اکشن‌ها
// (لایک / دیسلایک / پاسخ) + پاسخ‌ها در همان باکس پایین‌تر
// ========================================

/** آواتار — عکس کاربر یا حرف اول نام با رنگ ثابت بر اساس نام */
function Avatar({ author, size = "md" }: { author: ChatAuthor; size?: "sm" | "md" }) {
  const initial = author.name.trim().charAt(0).toUpperCase() || "؟";
  const hue = [...author.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden flex items-center justify-center font-bold text-white ${
        size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-base"
      }`}
      style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
    >
      {author.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.image} alt={author.name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

/** زمان نسبی — «۳ دقیقه پیش» / "3m ago" */
function timeAgo(iso: string, tr: (fa: string, en: string) => string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return tr("همین حالا", "just now");
  if (mins < 60) return tr(`${mins} دقیقه پیش`, `${mins}m ago`);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return tr(`${hours} ساعت پیش`, `${hours}h ago`);
  const days = Math.floor(hours / 24);
  if (days < 7) return tr(`${days} روز پیش`, `${days}d ago`);
  return new Date(iso).toLocaleDateString();
}

export default function ChatMessageCard({
  message,
  onReact,
  onReply,
  isReplyTarget,
  highlight,
}: {
  message: ChatMessageItem;
  onReact: (id: string, value: 1 | -1) => void;
  onReply: (m: ChatMessageItem) => void;
  isReplyTarget: boolean;
  highlight: boolean;
}) {
  const { tr, lang } = useLanguage();
  const extraCount = Math.max(0, message.replyCount - message.replies.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: highlight ? [1, 1.015, 1] : 1,
      }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className={[
        "rounded-2xl border p-4 transition-colors",
        isReplyTarget
          ? "border-blue-400 bg-blue-50/60 dark:border-blue-500/60 dark:bg-blue-500/10 ring-2 ring-blue-300/50 dark:ring-blue-500/30"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
      ].join(" ")}
    >
      {/* ---- سرِ باکس: آواتار + نام + زمان ---- */}
      <div className="flex items-center gap-3">
        <Avatar author={message.author} />
        <div className="min-w-0">
          <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
            {message.author.name}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            {timeAgo(message.createdAt, tr)}
          </div>
        </div>
      </div>

      {/* ---- متن پیام ---- */}
      <p className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
        {message.content}
      </p>

      {/* ---- پاسخ‌ها — در همان باکس، پایین‌تر ---- */}
      {message.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 dark:border-slate-700/70 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
            <MessageCircle className="w-3.5 h-3.5" />
            {tr(
              `${message.replyCount} پاسخ`,
              `${message.replyCount} ${message.replyCount === 1 ? "reply" : "replies"}`,
            )}
          </div>
          {message.replies.map((r: ChatReply) => (
            <ReplyBox key={r.id} reply={r} onReact={onReact} timeAgo={timeAgo} />
          ))}
          {extraCount > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 ps-1">
              {tr(`و ${extraCount} پاسخ دیگر...`, `+${extraCount} more replies...`)}
            </p>
          )}
        </div>
      )}

      {/* ---- اکشن‌ها ---- */}
      <div className="mt-3 flex items-center gap-1.5" dir={lang === "fa" ? "rtl" : "ltr"}>
        {/* لایک */}
        <ActionButton
          active={message.myReaction === 1}
          onClick={() => onReact(message.id, 1)}
          title={tr("پسندیدم", "Like")}
          activeClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
        >
          <ThumbsUp className="w-4 h-4" />
          {message.likes > 0 && <span>{message.likes}</span>}
        </ActionButton>

        {/* دیسلایک */}
        <ActionButton
          active={message.myReaction === -1}
          onClick={() => onReact(message.id, -1)}
          title={tr("نپسندیدم", "Dislike")}
          activeClass="bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300"
        >
          <ThumbsDown className="w-4 h-4" />
          {message.dislikes > 0 && <span>{message.dislikes}</span>}
        </ActionButton>

        {/* پاسخ */}
        <ActionButton
          active={isReplyTarget}
          onClick={() => onReply(message)}
          title={tr("جواب دادن", "Reply")}
          activeClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
        >
          <CornerDownRight className="w-4 h-4" />
          {tr("جواب", "Reply")}
        </ActionButton>
      </div>
    </motion.div>
  );
}

/** باکس پاسخ — کوچک‌تر و با حاشیه سمت شروع */
function ReplyBox({
  reply,
  onReact,
  timeAgo,
}: {
  reply: ChatReply;
  onReact: (id: string, value: 1 | -1) => void;
  timeAgo: (iso: string, tr: (fa: string, en: string) => string) => string;
}) {
  const { tr } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="flex gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-s-2 border-slate-200 dark:border-slate-700 p-2.5">
        <Avatar author={reply.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
              {reply.author.name}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {timeAgo(reply.createdAt, tr)}
            </span>
          </div>
          <p className="mt-0.5 text-sm leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
            {reply.content}
          </p>
          {/* واکنش‌های پاسخ */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <button
              onClick={() => onReact(reply.id, 1)}
              title={tr("پسندیدم", "Like")}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all active:scale-90 ${
                reply.myReaction === 1
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              {reply.likes > 0 && <span>{reply.likes}</span>}
            </button>
            <button
              onClick={() => onReact(reply.id, -1)}
              title={tr("نپسندیدم", "Dislike")}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all active:scale-90 ${
                reply.myReaction === -1
                  ? "bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              {reply.dislikes > 0 && <span>{reply.dislikes}</span>}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** دکمه اکشن کوچک */
function ActionButton({
  children,
  onClick,
  active,
  title,
  activeClass,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
  activeClass: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      whileTap={{ scale: 0.85 }}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? activeClass
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      }`}
    >
      {children}
    </motion.button>
  );
}
