"use client";

import { motion } from "motion/react";
import { ArrowLeft, Zap, PartyPopper, CheckCircle2 } from "lucide-react";
import type { MemoryRoundInfo } from "@/app/hook/useMemoryGame";
import { MEMORY_CONFIG } from "@/types/game";

// ========================================
// اورلی پایان یک راند (تخته کامل شد)
// نتیجه راند + دکمه راند بعدی / نتیجه نهایی
// ========================================

export default function MemoryRoundOverlay({
  info,
  matchedPairs,
  hasNext,
  onNext,
}: {
  info: MemoryRoundInfo;
  matchedPairs: number;
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
      {info.perfect && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-xs font-bold"
        >
          <Zap className="h-3.5 w-3.5" />
          راند بی‌نقص! +{MEMORY_CONFIG.perfectRoundBonus}
        </motion.div>
      )}

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
          {info.perfect ? (
            <PartyPopper className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
          ) : (
            <CheckCircle2 className="h-14 w-14 text-emerald-400" strokeWidth={1.5} />
          )}
        </motion.div>

        <h3 className="text-lg font-bold text-slate-800">
          راند {info.round} کامل شد!
        </h3>

        <p className="text-sm text-slate-500">
          هر <b className="text-emerald-600">{matchedPairs} جفت</b> را پیدا کردی
          با <b className="text-red-500">{info.mistakes} اشتباه</b>
        </p>

        <motion.button
          onClick={onNext}
          autoFocus
          whileTap={{ scale: 0.95 }}
          className="w-full mt-2 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {hasNext ? "راند بعدی" : "دیدن نتیجه نهایی"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
