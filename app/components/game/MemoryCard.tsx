"use client";

import { motion } from "motion/react";
import { HelpCircle, Check } from "lucide-react";
import type { MemoryCardItem } from "@/app/hook/useMemoryGame";

// ========================================
// یک کارت حافظه — فلیپ سه‌بعدی
// پشت کارت (بسته): علامت سوال | روی کارت: کلمه یا معنی
// en: متن انگلیسی (LTR) | fa: معنی فارسی (RTL)
// ========================================

// اندازه فونت هوشمند بر اساس طول متن
function textSize(text: string, side: "en" | "fa"): string {
  const len = text.length;
  if (side === "en") {
    if (len > 10) return "text-[10px] sm:text-[11px] md:text-xs";
    if (len > 7) return "text-[11px] sm:text-xs md:text-sm";
    return "text-xs sm:text-sm md:text-base";
  }
  if (len > 12) return "text-[10px] sm:text-[11px] md:text-xs";
  if (len > 8) return "text-[11px] sm:text-xs md:text-sm";
  return "text-xs sm:text-sm md:text-base";
}

export default function MemoryCard({
  card,
  isWrong,
  index,
  onClick,
}: {
  card: MemoryCardItem;
  // آیا این کارت الان بخشی از جفت اشتباه است؟ (قرمز می‌شود)
  isWrong: boolean;
  index: number;
  onClick: () => void;
}) {
  const faceUp = card.state !== "down";
  const matched = card.state === "matched";
  const clickable = !faceUp && !matched;

  // ---- استایل روی کارت (محتوا) ----
  const faceClasses = matched
    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
    : isWrong
      ? "border-red-300 bg-red-50 text-slate-700"
      : card.side === "en"
        ? "border-blue-200 bg-white text-slate-800"
        : "border-violet-200 bg-white text-slate-700";

  // نوار رنگی بالای کارت برای تشخیص زبان (بعد از باز شدن)
  const stripClasses = matched
    ? "bg-emerald-400"
    : card.side === "en"
      ? "bg-blue-400"
      : "bg-violet-400";

  return (
    <motion.button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      aria-label={faceUp ? card.text : "کارت بسته"}
      className="relative aspect-[3/4] w-full select-none focus:outline-none"
      style={{ perspective: 900 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.25 }}
      whileTap={clickable ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{
          rotateY: faceUp ? 180 : 0,
          scale: matched ? 0.95 : 1,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* ================= پشت کارت (بسته) ================= */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 rounded-xl border-2 border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center shadow-sm"
        >
          <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-slate-300" />
        </div>

        {/* ================= روی کارت (محتوا) ================= */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className={`absolute inset-0 rounded-xl border-2 flex flex-col items-center justify-center p-1 overflow-hidden transition-colors duration-200 ${faceClasses}`}
        >
          {/* نوار رنگی زبان */}
          <span className={`absolute top-0 inset-x-0 h-1 ${stripClasses}`} />

          {/* متن */}
          <span
            dir={card.side === "en" ? "ltr" : "rtl"}
            className={`px-0.5 font-bold leading-tight break-words text-center ${textSize(
              card.text,
              card.side,
            )}`}
          >
            {card.text}
          </span>

          {/* تیک جفت کامل */}
          {matched && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute bottom-0.5 right-1"
            >
              <Check className="w-3 h-3 text-emerald-500" />
            </motion.span>
          )}
        </div>
      </motion.div>
    </motion.button>
  );
}
