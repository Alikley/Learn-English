"use client";

import { motion } from "motion/react";
import { ArrowLeft, Zap, PartyPopper, Ghost } from "lucide-react";
import Confetti from "./Confetti";

// ========================================
// اورلی نتیجه یک کلمه (برد/باخت)
// ========================================

export default function WordResultOverlay({
  won,
  bonus,
  word,
  hint,
  hasNext,
  onNext,
}: {
  won: boolean;
  bonus: number;
  word: string;
  hint: string;
  hasNext: boolean;
  onNext: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {won && <Confetti />}
      <motion.div
        className="relative text-center space-y-3 max-w-xs w-full"
        initial={{ scale: 0.8, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
          className="flex justify-center"
        >
          {won ? (
            <PartyPopper className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
          ) : (
            <Ghost className="h-14 w-14 text-slate-400" strokeWidth={1.5} />
          )}
        </motion.div>
        <h3 className="text-lg font-bold text-slate-800">
          {won ? "آفرین! کلمه رو نجات دادی" : "آخ! هنگ‌من کامل شد"}
        </h3>
        <p
          dir="ltr"
          className="text-2xl font-extrabold tracking-widest text-slate-700"
        >
          {word}
        </p>
        <p className="text-sm text-slate-500">{hint}</p>
        {won && (
          <motion.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-amber-600 font-bold text-sm flex items-center justify-center gap-1"
          >
            <Zap className="h-4 w-4" />
            +{bonus} امتیاز پاداش
          </motion.p>
        )}
        <motion.button
          onClick={onNext}
          autoFocus
          whileTap={{ scale: 0.95 }}
          className="w-full mt-2 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {hasNext ? "کلمه بعدی" : "دیدن نتیجه نهایی"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
