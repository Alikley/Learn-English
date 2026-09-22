"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { Trophy, Flame, Sparkles } from "lucide-react";
import type { GameStats, StreakInfo } from "@/types/game";

// ========================================
// آمار روی کارت بازی در هاب بازی‌ها — سه حالت:
// ۱) بازی کرده → بهترین امتیاز + استریک
// ۲) استریک یادگیری دارد اما این بازی را نکرده → استریک + دعوت
// ۳) تازه‌وارد → دعوت شروع اولین دور
// (فقط در صفحه بازی‌ها نمایش داده می‌شود — گام ۶)
// ========================================

export default function GameCardStats({
  stats,
  streak,
  inviteText,
}: {
  stats: GameStats | null;
  streak: StreakInfo | null;
  inviteText?: string;
}) {
  const { tr } = useLanguage();

  // ---- ۱) بازی کرده ----
  if (stats && (stats.sessionsPlayed > 0 || stats.bestScore > 0)) {
    return (
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">
          <Trophy className="w-3 h-3" />
          {tr("بهترین:", "Best:")} {stats.bestScore}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold">
          <Flame className="w-3 h-3" />
          {streak?.current ?? 0} {tr("روز متوالی", "day streak")}
        </span>
      </div>
    );
  }

  // ---- ۲) استریک دارد اما بازی نکرده ----
  if ((streak?.current ?? 0) > 0) {
    return (
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold">
          <Flame className="w-3 h-3" />
          {streak?.current} {tr("روز متوالی", "day streak")}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">
          <Sparkles className="w-3 h-3" />
          {inviteText ?? tr("اولین دورت را شروع کن!", "Start your first round!")}
        </span>
      </div>
    );
  }

  // ---- ۳) تازه‌وارد ----
  return (
    <div className="flex items-center gap-2 mt-2.5">
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">
        <Sparkles className="w-3 h-3" />
        {tr("هنوز بازی نکرده‌ای", "Haven't played yet")} — {inviteText ?? tr("اولین دورت را شروع کن!", "Start your first round!")}
      </span>
    </div>
  );
}
