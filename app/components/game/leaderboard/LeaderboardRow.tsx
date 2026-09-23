"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { LeaderRow } from "@/app/hook/game/useLeaderboard";

// ========================================
// یک ردیف جدول برترین‌ها
// (از LeaderboardBox تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function LeaderboardRow({
  row,
  index,
  medalIcon,
  medalStyle,
}: {
  row: LeaderRow;
  index: number;
  medalIcon?: LucideIcon;
  medalStyle?: string;
}) {
  const { tr } = useLanguage();
  const MedalIcon = medalIcon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + index * 0.06 }}
      className={`flex items-center gap-3 rounded-xl px-2.5 py-2 border transition-colors ${
        row.isYou
          ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
          : "bg-slate-50/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      }`}
    >
      {/* رتبه */}
      {row.rank <= 3 && MedalIcon ? (
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${medalStyle ?? ""}`}
        >
          <MedalIcon className="w-4 h-4" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
            {row.rank}
          </span>
        </div>
      )}

      {/* نام */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={`text-sm truncate ${row.isYou ? "font-extrabold text-blue-700 dark:text-blue-300" : "font-medium text-slate-700 dark:text-slate-200"}`}
        >
          {row.name}
        </span>
        {row.isYou && (
          <span className="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-600 text-white">
            {tr("شما", "You")}
          </span>
        )}
      </div>

      {/* امتیاز */}
      <span
        className={`text-sm font-extrabold shrink-0 tabular-nums ${row.rank === 1 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200"}`}
      >
        {row.bestScore}
      </span>
    </motion.div>
  );
}
