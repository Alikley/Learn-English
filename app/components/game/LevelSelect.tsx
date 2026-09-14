"use client";

import { motion } from "motion/react";
import { Smile, Meh, Frown, Play } from "lucide-react";
import { GAME_CONFIG, GAME_LEVELS } from "@/types/game";
import type { GameLevel, GameLevelConfig } from "@/types/game";

// ========================================
// انتخاب سطح بازی — آسان / متوسط / سخت
// قابل استفاده برای همه بازی‌ها (هنگ‌من / حافظه / ...)
// levels و subtitle قابل سفارشی‌سازی هستند
// ========================================

const LEVEL_ICONS: Record<GameLevel, React.ComponentType<{ className?: string }>> = {
  EASY: Smile,
  MEDIUM: Meh,
  HARD: Frown,
};

const LEVEL_ICON_COLOR: Record<GameLevel, string> = {
  EASY: "bg-emerald-100 text-emerald-600",
  MEDIUM: "bg-orange-100 text-orange-600",
  HARD: "bg-red-100 text-red-600",
};

export default function LevelSelect({
  onSelect,
  levels = GAME_LEVELS,
  subtitle,
}: {
  onSelect: (level: GameLevel) => void;
  // لیست سطح‌های این بازی (پیش‌فرض: هنگ‌من)
  levels?: GameLevelConfig[];
  // متن زیر عنوان (پیش‌فرض: تعداد کلمات هر دور هنگ‌من)
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-7">
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold text-slate-800">سطح بازی را انتخاب کن</h2>
        <p className="text-sm text-slate-500 mt-1">
          {subtitle ?? `هر دور ${GAME_CONFIG.wordsPerSession} کلمه از سطح انتخابی دارد`}
        </p>
      </div>

      <div className="grid gap-3">
        {levels.map((lvl, i) => {
          const Icon = LEVEL_ICONS[lvl.id];
          return (
            <motion.button
              key={lvl.id}
              type="button"
              onClick={() => onSelect(lvl.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-right transition-colors ${lvl.theme}`}
            >
              {/* آیکون سطح */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${LEVEL_ICON_COLOR[lvl.id]}`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* توضیحات */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-800 text-base">
                    سطح {lvl.fa}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-slate-500 font-medium">
                    {lvl.lengthLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-5">{lvl.desc}</p>
              </div>

              {/* دکمه شروع */}
              <div className="shrink-0 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                <Play className="w-4 h-4 text-slate-600 rotate-180" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
