"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import type { SpeedQuizQuestion } from "@/types/game";
import type { SpeedQuizFeedback } from "@/app/hook/useSpeedQuizGame";

// ========================================
// گزینه‌های چهارگانه کوییز سرعتی — با انیمیشن:
// ورود پلکانی + درست: سبز و تیک جهشی
// + غلط: لرزش و قرمز + گزینه درست با تأخیر سبز می‌شود
// گزینه‌های سوال «کلمه» فارسی‌اند (RTL) و «جمله» انگلیسی (LTR)
// ========================================

const SHAKE_KEYFRAMES = { x: [0, -10, 10, -7, 7, -3, 0] };

export default function SpeedQuizOptions({
  question,
  feedback,
  onAnswer,
}: {
  question: SpeedQuizQuestion;
  feedback: SpeedQuizFeedback | null;
  onAnswer: (index: number) => void;
}) {
  // گزینه‌های سوال کلمه‌ای فارسی‌اند → RTL؛ جمله‌ای انگلیسی → LTR
  const optionsDir = question.type === "WORD" ? "rtl" : "ltr";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-4 md:px-8 pb-4 md:pb-6">
      {question.options.map((opt, i) => {
        const isSelected = feedback?.selectedIndex === i;
        const isCorrectOption = feedback && i === feedback.correctIndex;
        const isWrongSelected = isSelected && feedback && !feedback.correct;
        const isOther = feedback && !isSelected && !isCorrectOption;

        return (
          <motion.button
            key={`${question.id}-${i}`}
            type="button"
            disabled={Boolean(feedback)}
            onClick={() => onAnswer(i)}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={
              isWrongSelected
                ? { ...SHAKE_KEYFRAMES, opacity: 1, y: 0, scale: 1 }
                : { opacity: isOther ? 0.45 : 1, y: 0, scale: 1 }
            }
            transition={
              isWrongSelected
                ? { duration: 0.45 }
                : { delay: 0.08 + i * 0.06, type: "spring", stiffness: 300, damping: 22 }
            }
            whileHover={feedback ? undefined : { scale: 1.02, y: -2 }}
            whileTap={feedback ? undefined : { scale: 0.97 }}
            className={`
              relative flex items-center gap-2.5 rounded-2xl border-2 p-3 md:p-3.5
              font-bold transition-colors text-start
              ${
                feedback
                  ? isCorrectOption
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                    : isWrongSelected
                      ? "bg-red-50 border-red-400 text-red-600"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  : "bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer"
              }
            `}
          >
            {/* شماره گزینه */}
            <span
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                feedback
                  ? isCorrectOption
                    ? "bg-emerald-500 text-white"
                    : isWrongSelected
                      ? "bg-red-500 text-white"
                      : "bg-slate-200 text-slate-400"
                  : "bg-amber-100 text-amber-600"
              }`}
              dir="ltr"
            >
              {i + 1}
            </span>

            {/* متن گزینه */}
            <span
              className="flex-1 text-sm md:text-base leading-6 break-words"
              dir={optionsDir}
            >
              {opt}
            </span>

            {/* آیکون نتیجه */}
            {feedback && isCorrectOption && (
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
                className="shrink-0"
              >
                <Check className="w-5 h-5 text-emerald-500 stroke-[3]" />
              </motion.span>
            )}
            {feedback && isWrongSelected && (
              <motion.span
                initial={{ scale: 0, rotate: 30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
                className="shrink-0"
              >
                <X className="w-5 h-5 text-red-500 stroke-[3]" />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
