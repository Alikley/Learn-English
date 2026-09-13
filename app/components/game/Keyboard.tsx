"use client";

import { motion } from "motion/react";

// ========================================
// کیبورد حروف انگلیسی
// - حرف درست: سبز
// - حرف غلط: قرمز + خط‌خورده + لرزش
// - پشتیبانی لمس موبایل (دکمه‌های بزرگ)
// ========================================

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Keyboard({
  guessedLetters,
  word,
  disabled,
  onGuess,
}: {
  guessedLetters: string[];
  word: string; // کلمه با حروف بزرگ
  disabled?: boolean;
  onGuess: (letter: string) => void;
}) {
  return (
    <div
      dir="ltr"
      className="grid grid-cols-9 gap-1 sm:gap-1.5 md:gap-2 max-w-lg mx-auto"
      role="group"
      aria-label="کیبورد حروف"
    >
      {LETTERS.map((letter) => {
        const isGuessed = guessedLetters.includes(letter);
        const isCorrect = isGuessed && word.includes(letter);
        const isWrong = isGuessed && !isCorrect;

        return (
          <motion.button
            key={letter}
            type="button"
            onClick={() => onGuess(letter)}
            disabled={isGuessed || disabled}
            whileTap={!isGuessed && !disabled ? { scale: 0.8 } : undefined}
            animate={isWrong ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.3 }}
            className={[
              "h-9 sm:h-10 rounded-lg text-sm font-bold transition-colors duration-200 select-none touch-manipulation",
              isCorrect
                ? "bg-emerald-500 text-white shadow-sm"
                : isWrong
                  ? "bg-red-100 text-red-400 line-through"
                  : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100",
              isGuessed || disabled
                ? "cursor-not-allowed"
                : "cursor-pointer",
            ].join(" ")}
            aria-label={`حرف ${letter}`}
          >
            {letter}
          </motion.button>
        );
      })}
    </div>
  );
}
