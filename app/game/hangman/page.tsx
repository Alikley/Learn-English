"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Gamepad2, Lightbulb, RotateCcw, XCircle, ArrowRight } from "lucide-react";
import HangmanFigure from "@/app/components/game/HangmanFigure";
import HangmanTimer from "@/app/components/game/HangmanTimer";
import Keyboard from "@/app/components/game/Keyboard";
import WordDisplay from "@/app/components/game/WordDisplay";
import GameStatsBar from "@/app/components/game/GameStatsBar";
import LevelSelect from "@/app/components/game/LevelSelect";
import SessionTopBar from "@/app/components/game/SessionTopBar";
import WordResultOverlay from "@/app/components/game/WordResultOverlay";
import SessionEndOverlay from "@/app/components/game/SessionEndOverlay";
import { useHangmanGame } from "@/app/hook/useHangmanGame";
import { useGameStats } from "@/app/hook/useGameStats";
import {
  CATEGORY_LABELS,
  GAME_CONFIG,
  HANGMAN_TIMER_SECONDS,
  getGameLevel,
} from "@/types/game";

// ========================================
// صفحه بازی هنگ‌من
// منطق در useHangmanGame + useGameStats — اینجا فقط رندر
// v1.0.0.6 — گام ۲: تایمر حدس بر اساس سطح (۵/۷/۱۰ ثانیه)
// v1.0.0.6 — گام ۱: آمار زنده + حذف کارت استریک از صفحه
// ========================================

export default function HangmanPage() {
  const { stats, submitting, isNewRecord, submitSessionStart, submitWordResult, submitSession } =
    useGameStats();

  const game = useHangmanGame({
    onSessionStart: () => void submitSessionStart(),
    onWordFinish: (won) => void submitWordResult(won),
    onSessionFinish: (score) => void submitSession(score),
  });

  const {
    phase,
    level,
    words,
    wordIndex,
    currentWord,
    word,
    guessedLetters,
    wrongCount,
    lives,
    score,
    results,
    resultInfo,
    figureStatus,
    sessionWins,
    sessionLosses,
    hasMoreWords,
    timeLeftMs,
    timerTotalMs,
    levelSeconds,
    startGame,
    handleGuess,
    handleNextWord,
    handleRestart,
    handleBackToLevels,
  } = game;

  const levelFa = getGameLevel(level).fa;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">بازی هنگ کلمه</h1>
          <p className="text-sm text-slate-500">
            حروف را حدس بزن و کلمه را نجات بده!
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
      {/* اعداد همزمان با بازی زنده تغییر می‌کنند؛ کارت استریک حذف شده است */}
      <GameStatsBar stats={stats} />

      {/* ================= انتخاب سطح ================= */}
      {phase === "levelSelect" && <LevelSelect onSelect={startGame} />}

      {/* ================= کارت بازی ================= */}
      {phase !== "levelSelect" && (
        <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* ---- نوار بالای کارت ---- */}
          <SessionTopBar
            wordIndex={wordIndex}
            total={words.length}
            results={results}
            lives={lives}
            score={score}
          />

          {/* ---- تایمر حدس بر اساس سطح (گام ۲) ---- */}
          {(phase === "playing" || phase === "wordResult") && (
            <div className="pt-3">
              <HangmanTimer
                timeLeftMs={timeLeftMs}
                totalMs={timerTotalMs}
                levelSeconds={levelSeconds}
                frozen={phase !== "playing"}
              />
            </div>
          )}

          {/* ---- بدنه بازی ---- */}
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">
                در حال آماده‌سازی کلمات سطح {levelFa}...
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
                className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                تلاش مجدد
              </button>
            </div>
          )}

          {(phase === "playing" || phase === "wordResult" || phase === "sessionEnd") &&
            currentWord && (
              <>
                <div className="grid md:grid-cols-2 gap-4 p-4 md:p-6 items-center">
                  {/* فیگور هنگ‌من */}
                  <div className="order-2 md:order-1">
                    <HangmanFigure wrongCount={wrongCount} status={figureStatus} />
                  </div>

                  {/* راهنما + کلمه */}
                  <div className="order-1 md:order-2 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-100 rounded-xl p-3.5"
                    >
                      <p className="text-sm text-amber-800 flex items-center gap-2 flex-wrap">
                        <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                        <span className="font-medium">راهنما:</span>
                        <span className="font-bold">{currentWord.hint}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                          {CATEGORY_LABELS[currentWord.category] ?? currentWord.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getGameLevel(currentWord.level).color}`}
                        >
                          سطح {getGameLevel(currentWord.level).fa}
                        </span>
                        {/* بج CEFR کلمه */}
                        {currentWord.cefr && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold tracking-wide">
                            {currentWord.cefr}
                          </span>
                        )}
                      </div>
                    </motion.div>

                    {/* خانه‌های حروف */}
                    <WordDisplay
                      word={word}
                      guessedLetters={guessedLetters}
                      lost={figureStatus === "lost"}
                    />
                  </div>
                </div>

                {/* کیبورد */}
                <div className="px-4 pb-6">
                  <Keyboard
                    guessedLetters={guessedLetters}
                    word={word}
                    disabled={phase !== "playing"}
                    onGuess={handleGuess}
                  />
                  <p className="text-center text-[11px] text-slate-400 mt-3">
                    با کیبورد گوشی یا کامپیوتر هم می‌توانی تایپ کنی
                  </p>
                </div>
              </>
            )}

          {/* ============ اورلی نتیجه کلمه ============ */}
          {phase === "wordResult" && resultInfo && (
            <WordResultOverlay
              won={resultInfo.won}
              bonus={resultInfo.bonus}
              word={word}
              hint={currentWord?.hint ?? ""}
              hasNext={hasMoreWords}
              onNext={handleNextWord}
            />
          )}

          {/* ============ اورلی پایان دور ============ */}
          {phase === "sessionEnd" && (
            <SessionEndOverlay
              submitting={submitting}
              score={score}
              wins={sessionWins}
              losses={sessionLosses}
              stats={stats}
              isNewRecord={isNewRecord}
              onRestart={handleRestart}
              onChangeLevel={handleBackToLevels}
            />
          )}
        </div>
      )}

      {/* راهنمای امتیازدهی */}
      {phase !== "levelSelect" && (
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400 flex-wrap">
          <span>سطح: {levelFa}</span>
          <span className="text-slate-200">|</span>
          <span>زمان هر حدس: {HANGMAN_TIMER_SECONDS[level]} ثانیه</span>
          <span className="text-slate-200">|</span>
          <span>هر حرف درست: +{GAME_CONFIG.pointsPerLetter}</span>
          <span>
            پاداش برد: +{GAME_CONFIG.winBaseBonus} تا +
            {GAME_CONFIG.winBaseBonus + GAME_CONFIG.maxWrong * GAME_CONFIG.pointsPerLife}
          </span>
          <span>هر دور: {GAME_CONFIG.wordsPerSession} کلمه</span>
        </div>
      )}
    </div>
  );
}
