"use client";

import { motion } from "motion/react";

// ========================================
// حروف یک کلمه انگلیسی با انیمیشن استگر
// (از GameOutcomeOverlay تفکیک شد — v1.0.2.7 ریفکتوری)
// gameover → حروف از بالا می‌افتند + چرخش
// win      → حروف از حالت کوچک می‌پرند
// ========================================

export default function AnimatedWord({
  text,
  mode,
}: {
  text: string;
  mode: "gameover" | "win";
}) {
  return (
    <div className="flex justify-center flex-wrap" dir="ltr" aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          initial={
            mode === "gameover"
              ? { y: -70, opacity: 0, rotate: -18, scale: 1.35 }
              : { scale: 0, y: 26, opacity: 0 }
          }
          animate={
            mode === "gameover"
              ? { y: 0, opacity: 1, rotate: 0, scale: 1 }
              : { scale: 1, y: 0, opacity: 1 }
          }
          transition={{
            delay: 0.3 + i * 0.065,
            type: "spring",
            stiffness: 320,
            damping: 15,
          }}
          className={
            mode === "gameover"
              ? "text-3xl md:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-linear-to-b from-red-500 to-rose-700 drop-shadow-sm"
              : "text-2xl md:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-linear-to-b from-emerald-500 to-teal-700 drop-shadow-sm"
          }
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </div>
  );
}
