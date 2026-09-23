"use client";

import { motion } from "motion/react";

// ========================================
// جمله با جای خالی متحرک + کلمهٔ درست بعد از پاسخ
// (از SpeedQuizQuestionCard تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function BlankSentence({
  parts,
  blankWord,
  answeredCorrectly,
}: {
  /** جمله دور جای خالی تکه شده — parts[0] + ___ + بقیه */
  parts: string[];
  /** کلمهٔ درست — فقط بعد از پاسخ */
  blankWord: string | null;
  answeredCorrectly: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 20 }}
      className="max-w-xl leading-relaxed"
      dir="ltr"
    >
      <span className="text-lg md:text-2xl font-bold text-slate-700">
        {parts[0]}
      </span>
      {blankWord ? (
        /* بعد از پاسخ: کلمه درست در جای خالی */
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
          className={`inline-block mx-1 px-2.5 rounded-lg font-black ${
            answeredCorrectly
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-500"
          }`}
        >
          {blankWord}
        </motion.span>
      ) : (
        /* جای خالی: خط‌چین تپنده */
        <motion.span
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ repeat: Infinity, duration: 1.3 }}
          className="inline-block w-16 md:w-24 mx-1 border-b-4 border-dashed border-amber-400 align-baseline"
        >
          &nbsp;
        </motion.span>
      )}
      <span className="text-lg md:text-2xl font-bold text-slate-700">
        {parts.slice(1).join("___")}
      </span>
    </motion.div>
  );
}
