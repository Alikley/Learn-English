"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { Bot, User as UserIcon, Volume2, BookOpen } from "lucide-react";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import type { ConversationLine } from "@/data/lessons/types";

// ========================================
// یک حباب گفت‌وگو (خط قرمز سایت / خط آبی کاربر)
// (از ConversationView تفکیک شد — v1.0.2.7 ریفکتوری)
// خطوط قرمز با کلیک دوباره پخش می‌شوند.
// ========================================

export default function ConversationBubble({
  line,
  index,
  isActive,
  waitingUser,
  onReplay,
}: {
  line: ConversationLine;
  index: number;
  isActive: boolean;
  waitingUser: boolean;
  onReplay: (i: number) => void;
}) {
  const { tr } = useLanguage();
  const isSite = line.speaker === "site";
  const isWaitingHere = isActive && waitingUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`flex gap-2 ${isSite ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* آواتار */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
          isSite
            ? "bg-gradient-to-br from-rose-500 to-red-600"
            : "bg-gradient-to-br from-blue-500 to-indigo-600"
        } ${
          isActive
            ? "ring-4 ring-offset-1 " +
              (isSite ? "ring-red-200" : "ring-blue-200")
            : ""
        }`}
      >
        {isSite ? <Bot size={16} /> : <UserIcon size={16} />}
      </div>
      {/* حباب */}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 transition-shadow ${
          isSite
            ? "bg-gradient-to-br from-rose-50 to-red-50 border border-red-200 rounded-tr-sm cursor-pointer"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-tl-sm"
        } ${
          isActive
            ? isSite
              ? "shadow-[0_0_0_3px_rgba(244,63,94,0.25)]"
              : "shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
            : "shadow-sm"
        }`}
        onClick={() => void onReplay(index)}
      >
        <p
          dir="ltr"
          className={`text-left text-sm font-semibold leading-7 ${
            isSite ? "text-red-900" : "text-blue-900"
          }`}
        >
          <HoverableText text={line.en} />
        </p>
        <p className="text-[11px] text-slate-400 leading-5 mt-0.5">
          {line.fa}
        </p>
        {/* پخش مجدد فقط برای خطوط قرمز سایت */}
        {isSite && (
          <div className="flex justify-start mt-1">
            <span
              className={`flex items-center gap-1 text-[10px] ${
                isActive ? "text-red-400" : "text-red-300"
              } hover:text-red-400`}
            >
              <Volume2 size={12} />
              {tr("پخش مجدد", "Replay")}
            </span>
          </div>
        )}
        {!isSite && isWaitingHere && (
          <div className="flex justify-start mt-1">
            <span className="flex items-center gap-1 text-[10px] text-blue-400">
              <BookOpen size={12} />
              {tr("این جمله را شما بخوانید", "You read this sentence")}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
