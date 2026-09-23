"use client";

import { motion } from "motion/react";

// ========================================
// نمایش کلمه — خانه‌های حروف
// - حرف درست با فنر پر می‌شود
// - موقع باخت حروف جامانده قرمز نمایش داده می‌شوند
// ========================================

export default function WordDisplay({
  word,
  guessedLetters,
  lost,
}: {
  word: string; // کلمه با حروف بزرگ
  guessedLetters: string[];
  lost: boolean;
}) {
  const letters = word.split("");

  return (
    <div
      dir="ltr"
      className="flex flex-wrap justify-center gap-1.5 sm:gap-2"
    >
      {letters.map((letter, i) => {
        const isGuessed = guessedLetters.includes(letter);
        const revealed = isGuessed || lost;
        const missed = lost && !isGuessed;

        return (
          <div
            key={`${word}-${i}`}
            className={[
              "w-8 h-11 sm:w-10 sm:h-13 rounded-lg bg-white flex items-center justify-center shadow-sm",
              missed
                ? "border-b-4 border-red-300"
                : isGuessed
                  ? "border-b-4 border-emerald-400"
                  : "border-b-4 border-slate-300",
            ].join(" ")}
          >
            {revealed && (
              <motion.span
                key={`${letter}-${i}`}
                initial={{ opacity: 0, y: -14, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={[
                  "text-lg sm:text-xl font-extrabold",
                  missed ? "text-red-500" : "text-emerald-600",
                ].join(" ")}
              >
                {letter}
              </motion.span>
            )}
          </div>
        );
      })}
    </div>
  );
}
