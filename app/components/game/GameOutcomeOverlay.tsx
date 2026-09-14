"use client";

import { motion } from "motion/react";
import { Trophy, Play, ArrowRight, ArrowLeft, RotateCcw, XCircle } from "lucide-react";
import type { GameStats } from "@/types/game";
import Confetti from "./Confetti";

// ========================================
// اورلی نتیجه نهایی بازی — v1.0.0.6 (گام ۳ و ۴)
//
// دو حالت با انیمیشن جذاب:
//   ✗ gameover → «GAME OVER» قرمز انیمیشنی (حروف دانه‌دانه می‌افتند)
//                + دکمه‌های «دوباره» و «بازگشت»
//   ✓ win      → «CONGRATULATIONS» سبز انیمیشنی (حروف می‌پرند + کانفتی)
//                + دکمه‌های «مرحله بعد» و «بازگشت»
//
// هیچ‌جا شماره/نام مرحله نمایش داده نمی‌شود — پیشرفت بی‌صدا است.
// استریک هم اینجا نشان داده نمی‌شود (گام ۱ — فقط کارت آن حذف شد).
// ========================================

// ---- حروف یک کلمه انگلیسی با انیمیشن استگر ----
function AnimatedWord({
  text,
  mode,
}: {
  text: string;
  mode: "gameover" | "win";
}) {
  return (
    <div className="flex justify-center flex-wrap" dir="ltr" aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          initial={
            mode === "gameover"
              ? { y: -70, opacity: 0, rotate: -18, scale: 1.35 }
              : { scale: 0, y: 26, opacity: 0 }
          }
          animate={
            mode === "gameover"
              ? { y: 0, opacity: 1, rotate: 0, scale: 1 }
              : { scale: 1, y: 0, opacity: 1 }
          }
          transition={{
            delay: 0.3 + i * 0.065,
            type: "spring",
            stiffness: 320,
            damping: 15,
          }}
          className={
            mode === "gameover"
              ? "text-3xl md:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-linear-to-b from-red-500 to-rose-700 drop-shadow-sm"
              : "text-2xl md:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-linear-to-b from-emerald-500 to-teal-700 drop-shadow-sm"
          }
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </div>
  );
}

export default function GameOutcomeOverlay({
  outcome,
  submitting = false,
  score,
  wins,
  losses,
  stats,
  isNewRecord,
  winLabel = "درست",
  lossLabel = "اشتباه",
  onRestart,
  onBack,
  onNext,
}: {
  outcome: "gameover" | "win";
  // در حال ثبت امتیاز در دیتابیس
  submitting?: boolean;
  score: number;
  wins: number;
  losses: number;
  stats: GameStats | null;
  isNewRecord: boolean;
  winLabel?: string;
  lossLabel?: string;
  // دوباره (همان سطح)
  onRestart: () => void;
  // بازگشت به انتخاب سطح
  onBack: () => void;
  // مرحله بعد — فقط در حالت برد (بدون نمایش شماره مرحله)
  onNext?: () => void;
}) {
  const isGameOver = outcome === "gameover";

  return (
    <motion.div
      className={`absolute inset-0 z-30 backdrop-blur flex items-center justify-center p-4 overflow-hidden ${
        isGameOver
          ? "bg-linear-to-b from-red-50/97 to-rose-100/97"
          : "bg-linear-to-b from-emerald-50/97 to-teal-100/97"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* کانفتی جشن — فقط برای برد */}
      {!isGameOver && !submitting && score > 0 && <Confetti count={36} />}

      <motion.div
        className="relative text-center space-y-4 max-w-sm w-full"
        initial={
          isGameOver
            ? { scale: 0.85, y: 20, x: 0 }
            : { scale: 0.8, y: 24 }
        }
        animate={
          isGameOver
            ? { scale: 1, y: 0, x: [0, -9, 9, -6, 6, -3, 0] }
            : { scale: 1, y: 0 }
        }
        transition={
          isGameOver
            ? { scale: { type: "spring", stiffness: 260, damping: 20 }, x: { delay: 0.25, duration: 0.5 } }
            : { type: "spring", stiffness: 260, damping: 20 }
        }
      >
        {submitting ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div
              className={`w-10 h-10 border-4 rounded-full animate-spin ${
                isGameOver
                  ? "border-red-200 border-t-red-600"
                  : "border-emerald-200 border-t-emerald-600"
              }`}
            />
            <p className="text-sm text-slate-500">در حال ثبت امتیاز...</p>
          </div>
        ) : (
          <>
            {/* آیکون بزرگ — با جهش/شناوری */}
            <motion.div
              initial={{ scale: 0, rotate: isGameOver ? -25 : -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
              className="flex justify-center"
            >
              <motion.div
                animate={
                  isGameOver
                    ? { scale: [1, 1.06, 1] }
                    : { y: [0, -8, 0] }
                }
                transition={{ repeat: Infinity, duration: isGameOver ? 1.1 : 2.2 }}
                className={`rounded-full p-4 ${
                  isGameOver
                    ? "bg-red-100 ring-8 ring-red-100/60"
                    : "bg-emerald-100 ring-8 ring-emerald-100/60"
                }`}
              >
                {isGameOver ? (
                  <XCircle className="h-12 w-12 text-red-500" strokeWidth={2} />
                ) : (
                  <Trophy className="h-12 w-12 text-amber-500 fill-amber-200" strokeWidth={1.5} />
                )}
              </motion.div>
            </motion.div>

            {/* جمله انگلیسی انیمیشنی — GAME OVER قرمز / CONGRATULATIONS سبز */}
            <AnimatedWord
              text={isGameOver ? "GAME OVER" : "CONGRATULATIONS"}
              mode={outcome}
            />

            {/* زیرنویس فارسی */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isGameOver ? 1.05 : 1.45 }}
              className={`text-sm font-bold ${isGameOver ? "text-red-400" : "text-emerald-600"}`}
            >
              {isGameOver ? "بازی تمام شد!" : "جان سالم به در بردی و برنده شدی!"}
            </motion.p>

            {/* خلاصه امتیاز — بدون شماره مرحله و بدون استریک */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: isGameOver ? 1.15 : 1.55 }}
              className="flex items-center justify-center gap-6 text-sm"
            >
              <div>
                <span className="text-slate-500">امتیاز کل: </span>
                <span className={`font-extrabold text-lg ${isGameOver ? "text-red-500" : "text-emerald-600"}`}>
                  {score}
                </span>
              </div>
              <div className="text-slate-200">|</div>
              <div>
                <span className="text-emerald-600 font-bold">{wins} {winLabel}</span>
                <span className="text-slate-400"> / </span>
                <span className="text-red-500 font-bold">{losses} {lossLabel}</span>
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
                  رکورد جدید!
                </motion.span>
              )}
              <span className="text-xs text-slate-500">
                بهترین امتیاز: <b className="text-slate-700">{stats?.bestScore ?? 0}</b>
              </span>
            </motion.div>

            {/* دکمه‌ها — با کمی تأخیر ظاهر می‌شوند */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isGameOver ? 1.3 : 1.7 }}
              className="flex gap-2 pt-1"
            >
              {isGameOver ? (
                <>
                  <motion.button
                    onClick={onRestart}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 bg-linear-to-l from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    دوباره
                  </motion.button>
                  <motion.button
                    onClick={onBack}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    title="بازگشت"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span className="hidden sm:inline">بازگشت</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={onNext}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    مرحله بعد
                  </motion.button>
                  <motion.button
                    onClick={onBack}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    title="بازگشت"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span className="hidden sm:inline">بازگشت</span>
                  </motion.button>
                </>
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
