"use client";

import { motion } from "motion/react";
import { Zap, XCircle, Flame } from "lucide-react";
import { MEMORY_CONFIG } from "@/types/game";

// ========================================
// نوار بالای کارت بازی حافظه
// شماره راند + نقاط پیشرفت جفت‌ها + اشتباهات + کمبو + امتیاز
// ========================================

export default function MemoryTopBar({
  round,
  totalRounds,
  matchedPairs,
  totalPairs,
  roundMistakes,
  combo,
  score,
}: {
  round: number;
  totalRounds: number;
  matchedPairs: number;
  totalPairs: number;
  roundMistakes: number;
  combo: number;
  score: number;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-slate-700">
          راند {Math.min(round + 1, totalRounds)} از {totalRounds}
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
        {/* اشتباهات راند */}
        <div className="flex items-center gap-1 bg-red-50 rounded-full px-2.5 py-1">
          <XCircle className="h-3.5 w-3.5 text-red-400" />
          <motion.span
            key={roundMistakes}
            initial={{ scale: 1.35 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="text-xs font-bold text-red-500"
          >
            {roundMistakes}
          </motion.span>
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
              کمبو ×{combo}
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
