"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion } from "motion/react";
import { Zap, Heart, Flame } from "lucide-react";

// ========================================
// نوار بالای کارت بازی حافظه کلمات
// شماره راند + نقاط پیشرفت جفت‌ها + جان‌های کل دور + کمبو + امتیاز
//
// v1.0.0.7 — گام ۱: جان‌های پویا — هر جفت درست یک جان برمی‌گرداند (تا سقف ۵ قلب)
//   و هر اشتباه یکی کم می‌کند؛ صفر شدن جان‌ها = پایان بازی
// ========================================

export default function MemoryTopBar({
  round,
  totalRounds,
  matchedPairs,
  totalPairs,
  lives,
  maxLives,
  combo,
  score,
}: {
  round: number;
  totalRounds: number;
  matchedPairs: number;
  totalPairs: number;
  // جان‌های باقی‌مانده کل دور (گام ۳)
  lives: number;
  maxLives: number;
  combo: number;
  score: number;
}) {
  const { tr } = useLanguage();

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-slate-700">
          {tr("راند", "Round")} {Math.min(round + 1, totalRounds)} {tr("از", "of")} {totalRounds}
        </span>
        {/* نقاط پیشرفت جفت‌ها */}
        {totalPairs > 0 && (
          <div className="flex items-center gap-1" dir="ltr">
            {Array.from({ length: totalPairs }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={[
                  "w-2 h-2 rounded-full",
                  i < matchedPairs
                    ? "bg-emerald-500"
                    : i === matchedPairs
                      ? "bg-amber-400 animate-pulse"
                      : "bg-slate-200",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* جان‌های کل دور — با هر اشتباه یکی با انیمیشن کم می‌شود (گام ۳) */}
        <div className="flex items-center gap-0.5 bg-red-50 rounded-full px-2 py-1" dir="ltr">
          {Array.from({ length: maxLives }).map((_, i) => {
            const alive = i < lives;
            return (
              <motion.span
                key={i}
                initial={false}
                animate={
                  alive
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0.7, opacity: 0.35, y: 2 }
                }
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
                className="flex items-center justify-center"
              >
                <Heart
                  className={`h-3.5 w-3.5 ${
                    alive ? "text-red-500 fill-red-400" : "text-slate-300"
                  }`}
                />
              </motion.span>
            );
          })}
        </div>

        {/* کمبو */}
        {combo >= 2 && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 bg-orange-50 rounded-full px-2.5 py-1"
          >
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">
              {tr("کمبو", "Combo")} ×{combo}
            </span>
          </motion.div>
        )}

        {/* امتیاز */}
        <div className="flex items-center gap-1 bg-amber-50 rounded-full px-2.5 py-1">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <motion.span
            key={score}
            initial={{ scale: 1.35 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="text-xs font-bold text-amber-600"
          >
            {score}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
