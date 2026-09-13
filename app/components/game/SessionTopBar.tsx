"use client";

import { motion } from "motion/react";
import { Heart, Zap } from "lucide-react";
import { GAME_CONFIG } from "@/types/game";

// ========================================
// نوار بالای کارت بازی
// شماره کلمه + نقاط پیشرفت + جان‌ها + امتیاز
// ========================================

export default function SessionTopBar({
  wordIndex,
  total,
  results,
  lives,
  score,
}: {
  wordIndex: number;
  total: number;
  results: boolean[];
  lives: number;
  score: number;
}) {
  const maxWrong = GAME_CONFIG.maxWrong;

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-slate-700">
          کلمه {Math.min(wordIndex + 1, total || 1)} از {total || GAME_CONFIG.wordsPerSession}
        </span>
        {/* نقاط پیشرفت کلمات */}
        {total > 0 && (
          <div className="flex items-center gap-1" dir="ltr">
            {Array.from({ length: total }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={[
                  "w-2 h-2 rounded-full",
                  i < results.length
                    ? results[i]
                      ? "bg-emerald-500"
                      : "bg-red-400"
                    : i === wordIndex
                      ? "bg-amber-400 animate-pulse"
                      : "bg-slate-200",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* جان‌ها */}
        <div className="flex items-center gap-0.5" dir="ltr">
          {Array.from({ length: maxWrong }).map((_, i) => (
            <motion.span
              key={`${lives}-${i}`}
              initial={i < lives ? { scale: 1.35 } : { scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <Heart
                className={[
                  "h-4 w-4",
                  i < lives
                    ? "text-red-500 fill-red-500"
                    : "text-slate-200 fill-slate-100",
                ].join(" ")}
              />
            </motion.span>
          ))}
        </div>
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
