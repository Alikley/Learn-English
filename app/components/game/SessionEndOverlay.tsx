"use client";

import { motion } from "motion/react";
import { Trophy, Flame, Play, Layers } from "lucide-react";
import type { GameStats, StreakInfo } from "@/types/game";
import Confetti from "./Confetti";

// ========================================
// اورلی پایان دور — نتیجه نهایی + ثبت امتیاز
// title / winLabel / lossLabel قابل سفارشی‌سازی‌اند
// (هنگ‌من: «پایان دور!» برد/باخت — حافظه: «پایان بازی!» جفت/اشتباه)
// ========================================

export default function SessionEndOverlay({
  submitting,
  score,
  wins,
  losses,
  stats,
  streak,
  isNewRecord,
  onRestart,
  onChangeLevel,
  title = "پایان دور!",
  winLabel = "برد",
  lossLabel = "باخت",
}: {
  submitting: boolean;
  score: number;
  wins: number;
  losses: number;
  stats: GameStats | null;
  streak: StreakInfo | null;
  isNewRecord: boolean;
  onRestart: () => void;
  onChangeLevel: () => void;
  title?: string;
  winLabel?: string;
  lossLabel?: string;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-30 bg-white/95 backdrop-blur flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {score > 0 && <Confetti count={32} />}
      <motion.div
        className="relative text-center space-y-4 max-w-sm w-full"
        initial={{ scale: 0.8, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {submitting ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">در حال ثبت امتیاز...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
            >
              <Trophy className="h-14 w-14 text-amber-400 mx-auto fill-amber-100" />
            </motion.div>

            <h3 className="text-xl font-bold text-slate-800">{title}</h3>

            {isNewRecord && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-xs font-bold"
              >
                <Trophy className="h-3.5 w-3.5" />
                رکورد جدید!
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">امتیاز کل: </span>
                <span className="font-extrabold text-lg text-amber-600">{score}</span>
              </div>
              <div className="text-slate-200">|</div>
              <div>
                <span className="text-emerald-600 font-bold">{wins} {winLabel}</span>
                <span className="text-slate-400"> / </span>
                <span className="text-red-500 font-bold">{losses} {lossLabel}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>
                بهترین امتیاز: <b className="text-slate-700">{stats?.bestScore ?? 0}</b>
              </span>
              {streak && (
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <b className="text-slate-700">{streak.current}</b> روز متوالی
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={onRestart}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                بازی مجدد
              </motion.button>
              <motion.button
                onClick={onChangeLevel}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                title="تغییر سطح"
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">تغییر سطح</span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
