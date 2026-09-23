"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { Brain } from "lucide-react";
import GameStatsBar from "@/app/components/game/GameStatsBar";
import GameOutcomeOverlay from "@/app/components/game/outcome/GameOutcomeOverlay";
import LevelSelect from "@/app/components/game/LevelSelect";
import LeaderboardBox from "@/app/components/game/leaderboard/LeaderboardBox";
import MemoryBoard from "@/app/components/game/memory/MemoryBoard";
import MemoryTopBar from "@/app/components/game/memory/MemoryTopBar";
import MemoryRoundOverlay from "@/app/components/game/memory/MemoryRoundOverlay";
import GameHeader from "@/app/components/game/shared/GameHeader";
import { GameLoading, GameError, GameScoringGuide } from "@/app/components/game/shared/GameStates";
import { useMemoryGame } from "@/app/hook/game/useMemoryGame";
import { useMemoryStats } from "@/app/hook/game/useMemoryStats";
import {
  MEMORY_CONFIG,
  MEMORY_LEVELS,
  getGameLevel,
} from "@/types/game";

// ========================================
// صفحه بازی حافظه کلمات
// منطق در useMemoryGame + useMemoryStats — اینجا فقط رندر
// v1.0.0.7 — گام ۱: جان‌های پویا (جفت درست +۱ / اشتباه −۱) در نوار بالا
// v1.0.0.7 — گام ۳: خروج وسط دور هم امتیاز را ثبت می‌کند
// v1.0.0.6 — گام ۳: ۳ اشتباه = Game Over انیمیشنی، برد = مرحله بعد
//   بدون نمایش شماره مرحله + جان‌ها در نوار بالا
// v1.0.0.6 — گام ۱: آمار زنده + حذف کارت استریک از صفحه
// v1.0.2.7 — ریفکتوری: هدر/لودینگ/خطا/راهنمای امتیاز مشترک (game/shared)
// ========================================

export default function MemoryPage() {
  const { tr, dir } = useLanguage();
  const { stats, submitting, isNewRecord, submitSessionStart, submitMatchResult, submitSession } =
    useMemoryStats();

  const game = useMemoryGame({
    onSessionStart: () => void submitSessionStart(),
    onPairMatch: () => void submitMatchResult(),
    onSessionFinish: (score, mistakes) => void submitSession(score, mistakes),
  });

  const {
    phase,
    level,
    hideLevel,
    totalRounds,
    roundIndex,
    cards,
    wrongPair,
    score,
    combo,
    sessionMistakes,
    sessionMatches,
    roundInfo,
    totalPairs,
    matchedPairs,
    hasMoreRounds,
    outcome,
    lives,
    maxLives,
    startGame,
    handleCardClick,
    handleNextRound,
    handleNextLevel,
    handleRestart,
    handleBackToLevels,
  } = game;

  const levelFa = tr(getGameLevel(level).fa, getGameLevel(level).en);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <GameHeader
        icon={Brain}
        iconClassName="bg-violet-50"
        title="Match Card"
        subtitle={tr(
          "کارت‌ها را باز کن و جفت کلمه انگلیسی + معنی فارسی را پیدا کن!",
          "Flip the cards and match English words with their Persian meanings!"
        )}
        isLevelSelect={phase === "levelSelect"}
        onBackToLevels={handleBackToLevels}
      />

      {/* ============ نوار آمار (فقط اینجا — گام ۱) ============ */}
      {/* اعداد همزمان با بازی زنده تغییر می‌کنند؛ کارت استریک حذف شده است */}
      <GameStatsBar stats={stats} winLabel={tr("جفت‌های درست", "Matched Pairs")} />

      {/* ================= انتخاب سطح + برترین امتیازها (v1.0.2.۲ — گام ۲) ================= */}
      {phase === "levelSelect" && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-4 items-start">
          <LevelSelect
            onSelect={startGame}
            levels={MEMORY_LEVELS}
            subtitle={tr(`هر بازی ${MEMORY_CONFIG.roundsPerSession} راند پشت سر هم — کارت‌ها را باز کن و جفت‌ها را مچ کن`, `Each game is ${MEMORY_CONFIG.roundsPerSession} rounds in a row — flip the cards and match the pairs`)}
          />
          <LeaderboardBox game="memory" />
        </div>
      )}

      {/* ================= کارت بازی ================= */}
      {phase !== "levelSelect" && (
        <div
          className={`relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${
            // v1.0.0.6 — حداقل ارتفاع در پایان بازی تا اورلی نتیجه
            // کاملاً داخل کارت جا شود و دکمه‌ها بریده نشوند
            phase === "sessionEnd" ? "min-h-[30rem]" : ""
          }`}
        >
          {/* ---- نوار بالای کارت: جان‌های کل دور (گام ۳) ---- */}
          <MemoryTopBar
            round={roundIndex}
            totalRounds={totalRounds}
            matchedPairs={matchedPairs}
            totalPairs={totalPairs}
            lives={lives}
            maxLives={maxLives}
            combo={combo}
            score={score}
          />

          {/* ---- بدنه بازی ---- */}
          {phase === "loading" && (
            <GameLoading
              text={
                /* گام ۳ — بعد از «مرحله بعد» نام سطح نمایش داده نمی‌شود */
                hideLevel
                  ? tr("در حال آماده‌سازی مرحله بعدی...", "Preparing the next stage...")
                  : tr(`در حال آماده‌سازی تخته سطح ${levelFa}...`, `Preparing the level ${levelFa} board...`)
              }
            />
          )}

          {phase === "error" && (
            <GameError
              onRetry={handleRestart}
              accent="bg-violet-50 text-violet-600 hover:bg-violet-100"
            />
          )}

          {(phase === "playing" ||
            phase === "roundResult" ||
            phase === "sessionEnd") &&
            cards.length > 0 && (
              <MemoryBoard
                cards={cards}
                wrongPair={wrongPair}
                onCardClick={handleCardClick}
              />
            )}

          {/* ============ اورلی پایان راند ============ */}
          {phase === "roundResult" && roundInfo && (
            <MemoryRoundOverlay
              info={roundInfo}
              matchedPairs={totalPairs}
              hasNext={hasMoreRounds}
              onNext={handleNextRound}
              score={score}
            />
          )}

          {/* ============ اورلی پایان بازی — GAME OVER / CONGRATULATIONS (گام ۳) ============ */}
          {phase === "sessionEnd" && outcome && (
            <GameOutcomeOverlay
              outcome={outcome}
              submitting={submitting}
              score={score}
              wins={sessionMatches}
              losses={sessionMistakes}
              stats={stats}
              isNewRecord={isNewRecord}
              winLabel={tr("جفت", "pair")}
              lossLabel={tr("اشتباه", "Wrong")}
              onRestart={handleRestart}
              onBack={handleBackToLevels}
              onNext={handleNextLevel}
            />
          )}
        </div>
      )}

      {/* راهنمای امتیازدهی */}
      {phase !== "levelSelect" && (
        <GameScoringGuide>
          <span>{tr("هر جفت درست:", "Each correct pair:")} +{MEMORY_CONFIG.pointsPerMatch}</span>
          <span className="text-slate-200">|</span>
          <span>{tr("هر جفت پشت سر هم:", "Back-to-back pairs:")} +{MEMORY_CONFIG.comboStepBonus} {tr("بیشتر", "extra")}</span>
          <span>{tr("راند بی‌نقص:", "Perfect round:")} +{MEMORY_CONFIG.perfectRoundBonus}</span>
          <span>
            {tr("جان‌ها:", "Lives:")} {MEMORY_CONFIG.startLives} ({tr("هر جفت درست +۱ تا سقف", "each correct pair +1 up to")} {MEMORY_CONFIG.maxLives}) | {tr("هر بازی:", "each game:")} {MEMORY_CONFIG.roundsPerSession} {tr("راند", "rounds")} ×{" "}
            {MEMORY_CONFIG.pairsPerBoard[level]} {tr("جفت", "pairs")}
          </span>
        </GameScoringGuide>
      )}
    </div>
  );
}
