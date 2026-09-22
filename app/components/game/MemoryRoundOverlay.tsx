"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion } from "motion/react";
import { ArrowLeft, Zap, PartyPopper, CheckCircle2 } from "lucide-react";
import type { MemoryRoundInfo } from "@/app/hook/useMemoryGame";
import { MEMORY_CONFIG } from "@/types/game";

// ========================================
// اورلی پایان یک راند (تخته کامل شد)
// نتیجه راند + دکمه راند بعدی / نتیجه نهایی
// v1.0.0.8 — امتیاز کل دور هم روی همین کارت دیده می‌شود
//   (قبلاً چیپ امتیاز پشت بلورِ اورلی پنهان می‌ماند)
// ========================================

export default function MemoryRoundOverlay({
  info,
  matchedPairs,
  hasNext,
  onNext,
  score,
}: {
  info: MemoryRoundInfo;
  matchedPairs: number;
  hasNext: boolean;
  onNext: () => void;
  // امتیاز کل دور تا پایان این راند — v1.0.0.8
  score: number;
}) {
  const { tr, lang } = useLanguage();
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
          {tr("راند بی‌نقص!", "Perfect round!")} +{MEMORY_CONFIG.perfectRoundBonus}
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
          {tr("راند", "Round")} {info.round} {tr("کامل شد!", "complete!")}
        </h3>

        <p className="text-sm text-slate-500">
          {lang === "en" ? (
            <>
              You found <b className="text-emerald-600">{matchedPairs} pairs</b> with{" "}
              <b className="text-red-500">{info.mistakes} mistakes</b>
            </>
          ) : (
            <>
              هر <b className="text-emerald-600">{matchedPairs} جفت</b> را پیدا کردی
              با <b className="text-red-500">{info.mistakes} اشتباه</b>
            </>
          )}
        </p>

        {/* v1.0.0.8 — امتیاز کل دور روی همین کارت */}
        <motion.p
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-slate-500"
        >
          {tr("امتیاز کل:", "Total Score:")}{" "}
          <motion.b
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 380, damping: 14 }}
            className="inline-block text-emerald-600 font-extrabold text-lg"
          >
            {score}
          </motion.b>
        </motion.p>

        <motion.button
          onClick={onNext}
          autoFocus
          whileTap={{ scale: 0.95 }}
          className="w-full mt-2 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {hasNext ? tr("راند بعدی", "Next Round") : tr("دیدن نتیجه نهایی", "See Final Result")}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
