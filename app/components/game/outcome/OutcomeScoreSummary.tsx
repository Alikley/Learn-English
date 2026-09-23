"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { GameStats } from "@/types/game";

// ========================================
// خلاصه امتیاز پایان بازی — بدون شماره مرحله و بدون استریک
// (از GameOutcomeOverlay تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function OutcomeScoreSummary({
  isGameOver,
  score,
  wins,
  losses,
  stats,
  isNewRecord,
  winLabel,
  lossLabel,
}: {
  isGameOver: boolean;
  score: number;
  wins: number;
  losses: number;
  stats: GameStats | null;
  isNewRecord: boolean;
  winLabel?: string;
  lossLabel?: string;
}) {
  const { tr } = useLanguage();

  return (
    <>
      {/* خلاصه امتیاز — بدون شماره مرحله و بدون استریک */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: isGameOver ? 1.15 : 1.55 }}
        className="flex items-center justify-center gap-6 text-sm"
      >
        <div>
          <span className="text-slate-500">{tr("امتیاز کل:", "Total Score:")} </span>
          <span className={`font-extrabold text-lg ${isGameOver ? "text-red-500" : "text-emerald-600"}`}>
            {score}
          </span>
        </div>
        <div className="text-slate-200">|</div>
        <div>
          <span className="text-emerald-600 font-bold">{wins} {winLabel ?? tr("درست", "Correct")}</span>
          <span className="text-slate-400"> / </span>
          <span className="text-red-500 font-bold">{losses} {lossLabel ?? tr("اشتباه", "Wrong")}</span>
        </div>
      </motion.div>

      {/* رکورد جدید + بهترین امتیاز */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: isGameOver ? 1.25 : 1.65 }}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        {isNewRecord && (
          <motion.span
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ delay: isGameOver ? 1.35 : 1.75, type: "spring", stiffness: 300 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-xs font-bold"
          >
            <Trophy className="h-3.5 w-3.5" />
            {tr("رکورد جدید!", "New Record!")}
          </motion.span>
        )}
        <span className="text-xs text-slate-500">
          {tr("بهترین امتیاز:", "Best Score:")} <b className="text-slate-700">{stats?.bestScore ?? 0}</b>
        </span>
      </motion.div>
    </>
  );
}
