"use client";

import { motion } from "motion/react";
import { Trophy, CheckCircle2, Gamepad2, Flame } from "lucide-react";
import type { GameStats, StreakInfo } from "@/types/game";

// ========================================
// چیپ آمار (فقط در صفحه بازی‌ها — گام ۶)
// ========================================

function StatChip({
  icon: Icon,
  label,
  value,
  classes,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  classes: string;
}) {
  return (
    <div className={`rounded-xl border p-2.5 text-center ${classes}`}>
      <Icon className="w-4 h-4 mx-auto mb-1" />
      <motion.div
        key={value}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="text-lg font-extrabold leading-none"
      >
        {value}
      </motion.div>
      <div className="text-[10px] mt-1 opacity-80">{label}</div>
    </div>
  );
}

// ========================================
// نوار آمار بازی — بهترین امتیاز / بردها / دفعات / استریک
// winLabel قابل سفارشی‌سازی است (هنگ‌من: «کلمات برده» / حافظه: «جفت‌های درست»)
// ========================================
export default function GameStatsBar({
  stats,
  streak,
  winLabel = "کلمات برده",
}: {
  stats: GameStats | null;
  streak: StreakInfo | null;
  winLabel?: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 mt-4 mb-5">
      <StatChip
        icon={Trophy}
        label="بهترین امتیاز"
        value={stats?.bestScore ?? 0}
        classes="bg-amber-50 border-amber-100 text-amber-600"
      />
      <StatChip
        icon={CheckCircle2}
        label={winLabel}
        value={stats?.totalWins ?? 0}
        classes="bg-emerald-50 border-emerald-100 text-emerald-600"
      />
      <StatChip
        icon={Gamepad2}
        label="دفعات بازی"
        value={stats?.sessionsPlayed ?? 0}
        classes="bg-blue-50 border-blue-100 text-blue-600"
      />
      <StatChip
        icon={Flame}
        label="روز متوالی"
        value={streak?.current ?? 0}
        classes="bg-orange-50 border-orange-100 text-orange-600"
      />
    </div>
  );
}
