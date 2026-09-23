"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { Gamepad2 } from "lucide-react";
import HangmanFigure from "@/app/components/game/hangman/HangmanFigure";
import HangmanTimer from "@/app/components/game/hangman/HangmanTimer";
import Keyboard from "@/app/components/game/hangman/Keyboard";
import WordDisplay from "@/app/components/game/hangman/WordDisplay";
import WordHintCard from "@/app/components/game/hangman/WordHintCard";
import SessionTopBar from "@/app/components/game/hangman/SessionTopBar";
import WordResultOverlay from "@/app/components/game/hangman/WordResultOverlay";
import SessionEndOverlay from "@/app/components/game/hangman/SessionEndOverlay";
import GameStatsBar from "@/app/components/game/GameStatsBar";
import LevelSelect from "@/app/components/game/LevelSelect";
import LeaderboardBox from "@/app/components/game/leaderboard/LeaderboardBox";
import GameHeader from "@/app/components/game/shared/GameHeader";
import { GameLoading, GameError, GameScoringGuide } from "@/app/components/game/shared/GameStates";
import { useHangmanGame } from "@/app/hook/game/useHangmanGame";
import { useGameStats } from "@/app/hook/game/useGameStats";
import {
  GAME_CONFIG,
  HANGMAN_TIMER_SECONDS,
  getGameLevel,
} from "@/types/game";

// ========================================
// صفحه بازی هنگ‌من
// منطق در useHangmanGame + useGameStats — اینجا فقط رندر
// v1.0.0.6 — گام ۲: تایمر حدس بر اساس سطح (۵/۷/۱۰ ثانیه)
// v1.0.0.6 — گام ۱: آمار زنده + حذف کارت استریک از صفحه
// v1.0.2.7 — ریفکتوری: هدر/لودینگ/خطا/راهنمای امتیاز مشترک
// (game/shared) + کارت راهنمای کلمه (hangman/WordHintCard)
// ========================================

export default function HangmanPage() {
  const { tr, dir } = useLanguage();
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

  const levelFa = tr(getGameLevel(level).fa, getGameLevel(level).en);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <GameHeader
        icon={Gamepad2}
        iconClassName="bg-emerald-50"
        title="Hangman"
        subtitle={tr("حروف را حدس بزن و کلمه را نجات بده!", "Guess the letters and save the word!")}
        isLevelSelect={phase === "levelSelect"}
        onBackToLevels={handleBackToLevels}
      />

      {/* ============ نوار آمار (فقط اینجا — گام ۱) ============ */}
      {/* اعداد همزمان با بازی زنده تغییر می‌کنند؛ کارت استریک حذف شده است */}
      <GameStatsBar stats={stats} />

      {/* ================= انتخاب سطح + برترین امتیازها (v1.0.2.۲ — گام ۲) ================= */}
      {phase === "levelSelect" && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-4 items-start">
          <LevelSelect onSelect={startGame} />
          <LeaderboardBox game="hangman" />
        </div>
      )}

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
            <GameLoading
              text={tr(`در حال آماده‌سازی کلمات سطح ${levelFa}...`, `Preparing words for level ${levelFa}...`)}
            />
          )}

          {phase === "error" && (
            <GameError
              onRetry={handleRestart}
              accent="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            />
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
                    <WordHintCard currentWord={currentWord} />

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
                    {tr("با کیبورد گوشی یا کامپیوتر هم می‌توانی تایپ کنی", "You can also type with your phone or computer keyboard")}
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
              score={score}
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
        <GameScoringGuide>
          <span>{tr("سطح:", "Level:")} {levelFa}</span>
          <span className="text-slate-200">|</span>
          <span>{tr("زمان هر حدس:", "Time per guess:")} {HANGMAN_TIMER_SECONDS[level]} {tr("ثانیه", "s")}</span>
          <span className="text-slate-200">|</span>
          <span>{tr("هر حرف درست:", "Each correct letter:")} +{GAME_CONFIG.pointsPerLetter}</span>
          <span>
            {tr("پاداش برد:", "Win bonus:")} +{GAME_CONFIG.winBaseBonus} {tr("تا", "to")} +
            +{GAME_CONFIG.winBaseBonus + GAME_CONFIG.maxWrong * GAME_CONFIG.pointsPerLife}
          </span>
          <span>{tr("هر دور:", "Each round:")} {GAME_CONFIG.wordsPerSession} {tr("کلمه", "words")}</span>
        </GameScoringGuide>
      )}
    </div>
  );
}
