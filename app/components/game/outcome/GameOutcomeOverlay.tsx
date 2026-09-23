"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion } from "motion/react";
import { Trophy, XCircle } from "lucide-react";
import type { GameStats } from "@/types/game";
import Confetti from "../Confetti";
import AnimatedWord from "./AnimatedWord";
import OutcomeScoreSummary from "./OutcomeScoreSummary";
import OutcomeActions from "./OutcomeActions";

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
//
// v1.0.2.7 — ریفکتوری: AnimatedWord + OutcomeScoreSummary + OutcomeActions
// به فایل‌های خودشان در همین فولدر تفکیک شدند.
// ========================================

export default function GameOutcomeOverlay({
  outcome,
  submitting = false,
  score,
  wins,
  losses,
  stats,
  isNewRecord,
  winLabel,
  lossLabel,
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
  const { tr } = useLanguage();
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
            <p className="text-sm text-slate-500">{tr("در حال ثبت امتیاز...", "Saving score...")}</p>
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
              {isGameOver ? tr("بازی تمام شد!", "Game Over!") : tr("جان سالم به در بردی و برنده شدی!", "You survived and won!")}
            </motion.p>

            {/* خلاصه امتیاز + رکورد */}
            <OutcomeScoreSummary
              isGameOver={isGameOver}
              score={score}
              wins={wins}
              losses={losses}
              stats={stats}
              isNewRecord={isNewRecord}
              winLabel={winLabel}
              lossLabel={lossLabel}
            />

            {/* دکمه‌ها */}
            <OutcomeActions
              isGameOver={isGameOver}
              onRestart={onRestart}
              onBack={onBack}
              onNext={onNext}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
