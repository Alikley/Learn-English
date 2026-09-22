"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Zap, RotateCcw, XCircle, ArrowRight } from "lucide-react";
import GameStatsBar from "@/app/components/game/GameStatsBar";
import GameOutcomeOverlay from "@/app/components/game/GameOutcomeOverlay";
import LevelSelect from "@/app/components/game/LevelSelect";
import LeaderboardBox from "@/app/components/game/LeaderboardBox";
import SpeedQuizTopBar from "@/app/components/game/SpeedQuizTopBar";
import SpeedQuizTimer from "@/app/components/game/SpeedQuizTimer";
import SpeedQuizQuestionCard from "@/app/components/game/SpeedQuizQuestionCard";
import SpeedQuizOptions from "@/app/components/game/SpeedQuizOptions";
import { useSpeedQuizGame } from "@/app/hook/useSpeedQuizGame";
import { useSpeedQuizStats } from "@/app/hook/useSpeedQuizStats";
import {
  SPEEDQUIZ_CONFIG,
  SPEEDQUIZ_LEVELS,
  getGameLevel,
} from "@/types/game";

// ========================================
// صفحه بازی کوییز سرعتی
// منطق در useSpeedQuizGame + useSpeedQuizStats — اینجا فقط رندر
// v1.0.0.7 — گام ۲: UI یکسان با بقیه بازی‌ها — حذف گوی‌های نورانی،
//   نوار آمار همیشه نمایان، لودر اسپینر ساده
// v1.0.0.6 — گام ۴: اتمام جان‌ها = GAME OVER قرمز، برد = CONGRATULATIONS سبز
//   + دکمه «مرحله بعد» بدون نمایش شماره مرحله
// v1.0.0.6 — گام ۱: آمار زنده + حذف کارت استریک از صفحه
// ========================================

export default function SpeedQuizPage() {
  const { stats, submitting, isNewRecord, submitSessionStart, submitAnswerResult, submitSession } =
    useSpeedQuizStats();

  const game = useSpeedQuizGame({
    onSessionStart: () => void submitSessionStart(),
    onCorrectAnswer: () => void submitAnswerResult(),
    onSessionFinish: (score, correct, wrong) => void submitSession(score, wrong),
  });

  const {
    phase,
    level,
    hideLevel,
    questions,
    qIndex,
    score,
    combo,
    lives,
    maxLives,
    correctCount,
    wrongCount,
    feedback,
    timeLeftMs,
    totalMs,
    lastGained,
    gainKey,
    totalQuestions,
    outcome,
    startGame,
    handleAnswer,
    handleRestart,
    handleNextLevel,
    handleBackToLevels,
  } = game;

  const levelFa = getGameLevel(level).fa;
  const currentQuestion = questions[qIndex] ?? null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <Zap className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">Quiz Hot</h1>
          <p className="text-sm text-slate-500">
            سریع جواب بده — هر ثانیه که می‌گذره، امتیاز کمتره!
          </p>
        </div>
        {/* بازگشت — در صفحه سطح‌بندی به هاب بازی‌ها، وسط بازی به سطح‌بندی */}
        {phase === "levelSelect" ? (
          <Link
            href="/game"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-600 text-xs font-bold transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            بازگشت
          </Link>
        ) : (
          <button
            onClick={handleBackToLevels}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            بازی‌ها
          </button>
        )}
      </div>

      {/* ============ نوار آمار (فقط اینجا — گام ۱) ============ */}
      {/* v1.0.0.7 — گام ۲: مثل دو بازی دیگر، نوار آمار همیشه نمایان است؛
          اعداد همزمان با بازی زنده تغییر می‌کنند؛ کارت استریک حذف شده است */}
      <GameStatsBar stats={stats} winLabel="پاسخ‌های درست" />

      {/* ================= انتخاب سطح + برترین امتیازها (v1.0.2.۲ — گام ۲) ================= */}
      {phase === "levelSelect" && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-4 items-start">
          <LevelSelect
            onSelect={startGame}
            levels={SPEEDQUIZ_LEVELS}
            subtitle={`هر دور ${SPEEDQUIZ_CONFIG.questionsPerSession} سوال چهارگزینه‌ای — کلمه و جمله، هر کدام ${SPEEDQUIZ_CONFIG.secondsPerQuestion} ثانیه`}
          />
          <LeaderboardBox game="speedquiz" />
        </div>
      )}

      {/* ================= کارت بازی ================= */}
      {phase !== "levelSelect" && (
        <div
          className={`relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${
            // v1.0.0.6 — حداقل ارتفاع در پایان بازی تا اورلی نتیجه
            // (که absolute است) کاملاً داخل کارت جا شود و دکمه‌ها بریده نشوند
            phase === "sessionEnd" ? "min-h-[34rem]" : ""
          }`}
        >
          {/* ---- نوار بالای بازی: پیشرفت + جان + امتیاز ---- */}
          <SpeedQuizTopBar
            qIndex={Math.min(qIndex, totalQuestions - 1)}
            totalQuestions={totalQuestions}
            lives={lives}
            maxLives={maxLives}
            score={score}
            combo={combo}
            lastGained={lastGained}
            gainKey={gainKey}
          />

          {/* ---- تایمر ---- */}
          <SpeedQuizTimer
            timeLeftMs={timeLeftMs}
            totalMs={totalMs}
            frozen={Boolean(feedback) || phase !== "playing"}
          />

          {/* ---- بدنه بازی ---- */}
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              <p className="text-sm text-slate-500">
                {/* گام ۴ — بعد از «مرحله بعد» نام سطح نمایش داده نمی‌شود */}
                {hideLevel
                  ? "در حال آماده‌سازی سوال‌های مرحله بعدی..."
                  : `در حال آماده‌سازی سوال‌های سطح ${levelFa}...`}
              </p>
            </div>
          )}

          {phase === "error" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <XCircle className="h-14 w-14 text-red-200" />
              <p className="text-slate-500 text-sm">
                خطا در بارگذاری بازی. دوباره تلاش کنید.
              </p>
              <button
                onClick={handleRestart}
                className="px-5 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                تلاش مجدد
              </button>
            </div>
          )}

          {/* ---- سوال‌ها با انیمیشن ورود/خروج ---- */}
          <AnimatePresence mode="wait">
            {phase === "playing" && currentQuestion && (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, x: -60, scale: 0.92, rotate: -1.5 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, x: 48, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              >
                <SpeedQuizQuestionCard
                  question={currentQuestion}
                  feedback={feedback}
                />
                <SpeedQuizOptions
                  question={currentQuestion}
                  feedback={feedback}
                  onAnswer={handleAnswer}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============ اورلی پایان بازی — GAME OVER / CONGRATULATIONS (گام ۴) ============ */}
          {phase === "sessionEnd" && outcome && (
            <GameOutcomeOverlay
              outcome={outcome}
              submitting={submitting}
              score={score}
              wins={correctCount}
              losses={wrongCount}
              stats={stats}
              isNewRecord={isNewRecord}
              winLabel="درست"
              lossLabel="غلط"
              onRestart={handleRestart}
              onBack={handleBackToLevels}
              onNext={handleNextLevel}
            />
          )}
        </div>
      )}

      {/* راهنمای امتیازدهی */}
      {phase !== "levelSelect" && (
        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-400 flex-wrap">
          {/* گام ۴ — بعد از «مرحله بعد» نام سطح نمایش داده نمی‌شود */}
          {!hideLevel && <span>سطح: {levelFa}</span>}
          {!hideLevel && <span className="text-slate-200">|</span>}
          <span>هر پاسخ درست: +{SPEEDQUIZ_CONFIG.basePoints}</span>
          <span>هر ثانیه باقی‌مانده: +{SPEEDQUIZ_CONFIG.timeBonusPerSecond}</span>
          <span>کمبو: +{SPEEDQUIZ_CONFIG.comboStepBonus} بیشتر</span>
          <span>دور بی‌نقص: +{SPEEDQUIZ_CONFIG.perfectSessionBonus}</span>
          <span>
            جان‌ها: {SPEEDQUIZ_CONFIG.lives} | هر بازی: {totalQuestions} سوال ×{" "}
            {SPEEDQUIZ_CONFIG.secondsPerQuestion} ثانیه
          </span>
        </div>
      )}
    </div>
  );
}
