"use client";

import Link from "next/link";
import { Brain, RotateCcw, XCircle, ArrowRight } from "lucide-react";
import GameStatsBar from "@/app/components/game/GameStatsBar";
import LevelSelect from "@/app/components/game/LevelSelect";
import SessionEndOverlay from "@/app/components/game/SessionEndOverlay";
import MemoryBoard from "@/app/components/game/MemoryBoard";
import MemoryTopBar from "@/app/components/game/MemoryTopBar";
import MemoryRoundOverlay from "@/app/components/game/MemoryRoundOverlay";
import { useMemoryGame } from "@/app/hook/useMemoryGame";
import { useMemoryStats } from "@/app/hook/useMemoryStats";
import {
  MEMORY_CONFIG,
  MEMORY_LEVELS,
  getGameLevel,
} from "@/types/game";

// ========================================
// صفحه بازی حافظه کلمات
// منطق در useMemoryGame + useMemoryStats — اینجا فقط رندر
// ========================================

export default function MemoryPage() {
  const { stats, streak, submitting, isNewRecord, submitMatchResult, submitSession } =
    useMemoryStats();

  const game = useMemoryGame({
    onPairMatch: () => void submitMatchResult(),
    onSessionFinish: (score, mistakes) => void submitSession(score, mistakes),
  });

  const {
    phase,
    level,
    totalRounds,
    roundIndex,
    cards,
    wrongPair,
    score,
    combo,
    roundMistakes,
    sessionMistakes,
    sessionMatches,
    roundInfo,
    totalPairs,
    matchedPairs,
    hasMoreRounds,
    startGame,
    handleCardClick,
    handleNextRound,
    handleRestart,
    handleBackToLevels,
  } = game;

  const levelFa = getGameLevel(level).fa;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <Brain className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">بازی حافظه کلمات</h1>
          <p className="text-sm text-slate-500">
            کارت‌ها را باز کن و جفت کلمه انگلیسی + معنی فارسی را پیدا کن!
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

      {/* ============ نوار آمار (فقط اینجا — گام ۶) ============ */}
      <GameStatsBar stats={stats} streak={streak} winLabel="جفت‌های درست" />

      {/* ================= انتخاب سطح ================= */}
      {phase === "levelSelect" && (
        <LevelSelect
          onSelect={startGame}
          levels={MEMORY_LEVELS}
          subtitle={`هر بازی ${MEMORY_CONFIG.roundsPerSession} راند پشت سر هم — کارت‌ها را باز کن و جفت‌ها را مچ کن`}
        />
      )}

      {/* ================= کارت بازی ================= */}
      {phase !== "levelSelect" && (
        <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* ---- نوار بالای کارت ---- */}
          <MemoryTopBar
            round={roundIndex}
            totalRounds={totalRounds}
            matchedPairs={matchedPairs}
            totalPairs={totalPairs}
            roundMistakes={roundMistakes}
            combo={combo}
            score={score}
          />

          {/* ---- بدنه بازی ---- */}
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">
                در حال آماده‌سازی تخته سطح {levelFa}...
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
                className="px-5 py-2 bg-violet-50 text-violet-600 rounded-xl text-sm font-medium hover:bg-violet-100 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                تلاش مجدد
              </button>
            </div>
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
            />
          )}

          {/* ============ اورلی پایان بازی ============ */}
          {phase === "sessionEnd" && (
            <SessionEndOverlay
              submitting={submitting}
              score={score}
              wins={sessionMatches}
              losses={sessionMistakes}
              stats={stats}
              streak={streak}
              isNewRecord={isNewRecord}
              onRestart={handleRestart}
              onChangeLevel={handleBackToLevels}
              title="پایان بازی!"
              winLabel="جفت"
              lossLabel="اشتباه"
            />
          )}
        </div>
      )}

      {/* راهنمای امتیازدهی */}
      {phase !== "levelSelect" && (
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400 flex-wrap">
          <span>سطح: {levelFa}</span>
          <span className="text-slate-200">|</span>
          <span>هر جفت درست: +{MEMORY_CONFIG.pointsPerMatch}</span>
          <span>هر جفت پشت سر هم: +{MEMORY_CONFIG.comboStepBonus} بیشتر</span>
          <span>راند بی‌نقص: +{MEMORY_CONFIG.perfectRoundBonus}</span>
          <span>
            هر بازی: {MEMORY_CONFIG.roundsPerSession} راند ×{" "}
            {MEMORY_CONFIG.pairsPerBoard[level]} جفت
          </span>
        </div>
      )}
    </div>
  );
}
