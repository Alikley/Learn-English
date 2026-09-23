"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion, AnimatePresence } from "motion/react";
import { Heart, Zap, Star } from "lucide-react";

// ========================================
// نوار بالای بازی کوییز سرعتی:
// پیشرفت سوال‌ها (نقطه‌ها) + جان‌ها (قلب) + امتیاز + کمبو
// همه با انیمیشن — قلب ازدست‌رفته جهش می‌کند،
// امتیاز با فنر بالا می‌پرد و کمبو پالس می‌زند.
// ========================================

function Hearts({ lives, maxLives }: { lives: number; maxLives: number }) {
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {Array.from({ length: maxLives }, (_, i) => {
        const alive = i < lives;
        return (
          <motion.span
            key={`${i}-${alive}`}
            initial={alive ? false : { scale: 1.5, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
            className="block"
          >
            <Heart
              className={`w-4.5 h-4.5 md:w-5 md:h-5 transition-colors ${
                alive
                  ? "text-red-500 fill-red-400"
                  : "text-slate-300 fill-slate-200"
              }`}
            />
          </motion.span>
        );
      })}
    </div>
  );
}

export default function SpeedQuizTopBar({
  qIndex,
  totalQuestions,
  lives,
  maxLives,
  score,
  combo,
  lastGained,
  gainKey,
}: {
  qIndex: number;
  totalQuestions: number;
  lives: number;
  maxLives: number;
  score: number;
  combo: number;
  // برای انیمیشن «+N امتیاز»
  lastGained: number;
  gainKey: number;
}) {
  const { tr } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-slate-100 bg-slate-50/60 flex-wrap">
      {/* ---- پیشرفت سوال‌ها ---- */}
      <div className="flex items-center gap-2 order-1">
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
          {tr("سوال", "Question")} {qIndex + 1} {tr("از", "of")} {totalQuestions}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const done = i < qIndex;
            const current = i === qIndex;
            return (
              <motion.span
                key={i}
                animate={
                  current
                    ? { scale: [1, 1.35, 1] }
                    : { scale: 1 }
                }
                transition={
                  current ? { repeat: Infinity, duration: 1.4 } : {}
                }
                className={`block w-1.5 h-1.5 rounded-full ${
                  done
                    ? "bg-amber-400"
                    : current
                      ? "bg-amber-500"
                      : "bg-slate-200"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ---- جان‌ها ---- */}
      <div className="order-2">
        <Hearts lives={lives} maxLives={maxLives} />
      </div>

      {/* ---- امتیاز + کمبو ---- */}
      <div className="flex items-center gap-2 order-3 relative">
        {/* بج کمبو — فقط از ۲ پاسخ درست پشت سر هم */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.span
              key="combo"
              initial={{ scale: 0, opacity: 0, rotate: -8 }}
              animate={{
                scale: [1, 1.08, 1],
                opacity: 1,
                rotate: 0,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { repeat: Infinity, duration: 1.1 },
                default: { type: "spring", stiffness: 380, damping: 16 },
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-600 text-[11px] font-extrabold whitespace-nowrap"
            >
              <Star className="w-3 h-3 fill-violet-400" />
              {tr("کمبو", "Combo")} ×{combo}
            </motion.span>
          )}
        </AnimatePresence>

        {/* امتیاز — با هر تغییر جهش فنری */}
        <div className="relative">
          <motion.div
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-sm font-extrabold tabular-nums whitespace-nowrap"
            dir="ltr"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            {score}
          </motion.div>

          {/* انیمیشن «+N» — بالا می‌رود و محو می‌شود */}
          {lastGained > 0 && (
            <motion.span
              key={gainKey}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, -6, -18, -26], scale: [0.7, 1.2, 1, 0.9] }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-extrabold text-emerald-500 pointer-events-none whitespace-nowrap"
              dir="ltr"
            >
              +{lastGained}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
