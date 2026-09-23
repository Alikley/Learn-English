"use client";

import { motion } from "motion/react";
import { BookOpen } from "lucide-react";

// ========================================
// بج‌های بالای کارت سوال: نوع سوال + سطح CEFR + دسته
// (از SpeedQuizQuestionCard تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function QuizBadges({
  isWord,
  typeIcon: TypeIcon,
  typeLabel,
  cefr,
  categoryLabel,
}: {
  isWord: boolean;
  typeIcon: typeof BookOpen;
  typeLabel: string;
  cefr?: string;
  categoryLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center mb-3 md:mb-4">
      <motion.span
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 16 }}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
          isWord
            ? "bg-sky-50 border border-sky-200 text-sky-600"
            : "bg-violet-50 border border-violet-200 text-violet-600"
        }`}
      >
        <TypeIcon className="w-3.5 h-3.5" />
        {typeLabel}
      </motion.span>
      {cefr && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.06, type: "spring", stiffness: 350 }}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-white font-bold tracking-wide"
        >
          {cefr}
        </motion.span>
      )}
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 350 }}
        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold"
      >
        {categoryLabel}
      </motion.span>
    </div>
  );
}
