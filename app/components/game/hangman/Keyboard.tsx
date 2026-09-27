"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion } from "motion/react";

// ========================================
// کیبورد حروف انگلیسی (v1.0.3.0 — گام ۱)
// - چیدمان QWERTY سه‌ردیفه مثل کیبورد گوشی و کامپیوتر
// - ردیف ۱: QWERTYUIOP (۱۰ کلید)
// - ردیف ۲: ASDFGHJKL (۹ کلید)
// - ردیف ۳: ZXCVBNM (۷ کلید)
// - حرف درست: سبز / حرف غلط: قرمز + خط‌خورده + لرزش
// - پشتیبانی لمس موبایل (دکمه‌های بزرگ)
// ========================================

const KEYBOARD_ROWS: string[][] = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split(""),
];

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
  const { tr } = useLanguage();
  return (
    <div
      dir="ltr"
      className="flex flex-col items-center gap-1 sm:gap-1.5 max-w-lg mx-auto"
      role="group"
      aria-label={tr("کیبورد حروف", "Letter Keyboard")}
    >
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex justify-center gap-1 sm:gap-1.5"
          role="row"
        >
          {row.map((letter) => {
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
                  "w-8 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-bold transition-colors duration-200 select-none touch-manipulation",
                  isCorrect
                    ? "bg-emerald-500 text-white shadow-sm"
                    : isWrong
                      ? "bg-red-100 dark:bg-red-500/20 text-red-400 dark:text-red-300 line-through"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300 active:bg-emerald-100",
                  isGuessed || disabled
                    ? "cursor-not-allowed"
                    : "cursor-pointer",
                ].join(" ")}
                aria-label={tr(`حرف ${letter}`, `Letter ${letter}`)}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
