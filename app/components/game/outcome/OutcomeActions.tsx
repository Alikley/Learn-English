"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

// ========================================
// دکمه‌های پایان بازی — با کمی تأخیر ظاهر می‌شوند
// (از GameOutcomeOverlay تفکیک شد — v1.0.2.7 ریفکتوری)
//   gameover → «دوباره» + «بازگشت»
//   win      → «مرحله بعد» + «بازگشت»
// ========================================

export default function OutcomeActions({
  isGameOver,
  onRestart,
  onBack,
  onNext,
}: {
  isGameOver: boolean;
  onRestart: () => void;
  onBack: () => void;
  onNext?: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isGameOver ? 1.3 : 1.7 }}
      className="flex gap-2 pt-1"
    >
      {isGameOver ? (
        <>
          <motion.button
            onClick={onRestart}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-6 py-3 bg-linear-to-l from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {tr("دوباره", "Again")}
          </motion.button>
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            title={tr("بازگشت", "Back")}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">{tr("بازگشت", "Back")}</span>
          </motion.button>
        </>
      ) : (
        <>
          <motion.button
            onClick={onNext}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr("مرحله بعد", "Next Stage")}
          </motion.button>
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            title={tr("بازگشت", "Back")}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">{tr("بازگشت", "Back")}</span>
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
