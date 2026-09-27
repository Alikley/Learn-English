"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion } from "motion/react";

// ========================================
// کیبورد حروف انگلیسی (v1.0.3.0 — گام ۱)
// - چیدمان حروف طبق کیبورد واقعی گوشی/کامپیوتر (QWERTY):
//     ردیف ۱: Q W E R T Y U I O P
//     ردیف ۲: A S D F G H J K L
//     ردیف ۳: Z X C V B N M
//   دکمه‌های هر ردیف flex-1 هستند → مثل کیبورد گوشی،
//   ردیف‌های کم‌حرف پهن‌تر دیده می‌شوند
// - حرف درست: سبز
// - حرف غلط: قرمز + خط‌خورده + لرزش
// - پشتیبانی لمس موبایل (دکمه‌های بزرگ)
// ========================================

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

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
      className="max-w-lg mx-auto space-y-1.5 sm:space-y-2"
      role="group"
      aria-label={tr("کیبورد حروف", "Letter Keyboard")}
    >
      {KEY_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 px-1">
          {row.split("").map((letter) => {
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
                  "flex-1 h-9 sm:h-10 rounded-lg text-sm font-bold transition-colors duration-200 select-none touch-manipulation",
                  isCorrect
                    ? "bg-emerald-500 text-white shadow-sm"
                    : isWrong
                      ? "bg-red-100 text-red-400 line-through"
                      : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100",
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
