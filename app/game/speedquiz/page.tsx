"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import GameStatsBar from "@/app/components/game/GameStatsBar";
import GameOutcomeOverlay from "@/app/components/game/outcome/GameOutcomeOverlay";
import LevelSelect from "@/app/components/game/LevelSelect";
import LeaderboardBox from "@/app/components/game/leaderboard/LeaderboardBox";
import SpeedQuizTopBar from "@/app/components/game/speedquiz/SpeedQuizTopBar";
import SpeedQuizTimer from "@/app/components/game/speedquiz/SpeedQuizTimer";
import SpeedQuizQuestionCard from "@/app/components/game/speedquiz/SpeedQuizQuestionCard";
import SpeedQuizOptions from "@/app/components/game/speedquiz/SpeedQuizOptions";
import GameHeader from "@/app/components/game/shared/GameHeader";
import { GameLoading, GameError, GameScoringGuide } from "@/app/components/game/shared/GameStates";
import { useSpeedQuizGame } from "@/app/hook/game/useSpeedQuizGame";
import { useSpeedQuizStats } from "@/app/hook/game/useSpeedQuizStats";
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
// v1.0.2.7 — ریفکتوری: هدر/لودینگ/خطا/راهنمای امتیاز مشترک (game/shared)
// ========================================

export default function SpeedQuizPage() {
  const { tr, dir } = useLanguage();
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

  const levelFa = tr(getGameLevel(level).fa, getGameLevel(level).en);
  const currentQuestion = questions[qIndex] ?? null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <GameHeader
        icon={Zap}
        iconClassName="bg-amber-50"
        title="Quiz Hot"
        subtitle={tr("سریع جواب بده — هر ثانیه که می‌گذره، امتیاز کمتره!", "Answer fast — every second that passes is worth fewer points!")}
        isLevelSelect={phase === "levelSelect"}
        onBackToLevels={handleBackToLevels}
      />

      {/* ============ نوار آمار (فقط اینجا — گام ۱) ============ */}
      {/* v1.0.0.7 — گام ۲: مثل دو بازی دیگر، نوار آمار همیشه نمایان است؛
          اعداد همزمان با بازی زنده تغییر می‌کنند؛ کارت استریک حذف شده است */}
      <GameStatsBar stats={stats} winLabel={tr("پاسخ‌های درست", "Correct Answers")} />

      {/* ================= انتخاب سطح + برترین امتیازها (v1.0.2.۲ — گام ۲) ================= */}
      {phase === "levelSelect" && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-4 items-start">
          <LevelSelect
            onSelect={startGame}
            levels={SPEEDQUIZ_LEVELS}
            subtitle={tr(`هر دور ${SPEEDQUIZ_CONFIG.questionsPerSession} سوال چهارگزینه‌ای — کلمه و جمله، هر کدام ${SPEEDQUIZ_CONFIG.secondsPerQuestion} ثانیه`, `Each round has ${SPEEDQUIZ_CONFIG.questionsPerSession} multiple-choice questions — words and sentences, ${SPEEDQUIZ_CONFIG.secondsPerQuestion} seconds each`)}
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
            <GameLoading
              text={
                /* گام ۴ — بعد از «مرحله بعد» نام سطح نمایش داده نمی‌شود */
                hideLevel
                  ? tr("در حال آماده‌سازی سوال‌های مرحله بعدی...", "Preparing questions for the next stage...")
                  : tr(`در حال آماده‌سازی سوال‌های سطح ${levelFa}...`, `Preparing questions for level ${levelFa}...`)
              }
            />
          )}

          {phase === "error" && (
            <GameError
              onRetry={handleRestart}
              accent="bg-amber-50 text-amber-600 hover:bg-amber-100"
            />
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
              winLabel={tr("درست", "Correct")}
              lossLabel={tr("غلط", "Wrong")}
              onRestart={handleRestart}
              onBack={handleBackToLevels}
              onNext={handleNextLevel}
            />
          )}
        </div>
      )}

      {/* راهنمای امتیازدهی */}
      {phase !== "levelSelect" && (
        <GameScoringGuide gapClass="gap-3">
          {/* گام ۴ — بعد از «مرحله بعد» نام سطح نمایش داده نمی‌شود */}
          {!hideLevel && <span>{tr("سطح:", "Level:")} {levelFa}</span>}
          {!hideLevel && <span className="text-slate-200">|</span>}
          <span>{tr("هر پاسخ درست:", "Each correct answer:")} +{SPEEDQUIZ_CONFIG.basePoints}</span>
          <span>{tr("هر ثانیه باقی‌مانده:", "Each second left:")} +{SPEEDQUIZ_CONFIG.timeBonusPerSecond}</span>
          <span>{tr("کمبو:", "Combo:")} +{SPEEDQUIZ_CONFIG.comboStepBonus} {tr("بیشتر", "extra")}</span>
          <span>{tr("دور بی‌نقص:", "Perfect round:")} +{SPEEDQUIZ_CONFIG.perfectSessionBonus}</span>
          <span>
            {tr("جان‌ها:", "Lives:")} {SPEEDQUIZ_CONFIG.lives} | {tr("هر بازی:", "each game:")} {totalQuestions} {tr("سوال", "questions")} ×{" "}
            {SPEEDQUIZ_CONFIG.secondsPerQuestion} {tr("ثانیه", "s")}
          </span>
        </GameScoringGuide>
      )}
    </div>
  );
}
