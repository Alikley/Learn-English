"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { StarsResult } from "@/app/training/_components/PracticeResultBits";

// ========================================
// کارت نتیجهٔ تمرین شنیداری [episodeId]
// (از صفحهٔ [episodeId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export type EpisodeResult = {
  correct: number;
  total: number;
  stars: number;
  xpEarned: number;
  percent: number;
};

export default function ResultCard({
  result,
  onBack,
}: {
  result: EpisodeResult;
  onBack: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-lg p-6 text-center"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {tr("نتیجه تمرین", "Practice Result")}
        </h3>

        <StarsResult count={result.stars} />

        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="text-slate-500">{tr("پاسخ صحیح:", "Correct answer:")} </span>
            <span className="font-bold text-slate-800">
              {result.correct}/{result.total}
            </span>
          </div>
          <div className="text-slate-300">|</div>
          <div>
            <span className="text-slate-500">{tr("درصد:", "Score:")} </span>
            <span className="font-bold text-slate-800">
              {result.percent}%
            </span>
          </div>
          <div className="text-slate-300">|</div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="font-bold text-orange-600">
              +{result.xpEarned} XP
            </span>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            {tr("بازگشت به لیست تمرین‌ها", "Back to Practice List")}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
