"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Gamepad2,
  Heart,
  Zap,
  Trophy,
  Flame,
  Lightbulb,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Play,
} from "lucide-react";
import HangmanFigure from "@/app/components/game/HangmanFigure";
import type { FigureStatus } from "@/app/components/game/HangmanFigure";
import Keyboard from "@/app/components/game/Keyboard";
import WordDisplay from "@/app/components/game/WordDisplay";
import Confetti from "@/app/components/game/Confetti";
import { CATEGORY_LABELS, getGameLevel } from "@/types/game";
import type { HangmanWord, GameStats, StreakInfo } from "@/types/game";

// ========================================
// تنظیمات بازی
// ========================================
const WORDS_PER_SESSION = 10;
const MAX_WRONG = 6;
const POINTS_PER_LETTER = 10; // امتیاز هر حرف درست
const WIN_BASE_BONUS = 40; // پاداش پایه برد کلمه
const POINTS_PER_LIFE = 10; // پاداش هر جان باقی‌مانده

type Phase = "loading" | "playing" | "wordResult" | "sessionEnd" | "error";

// ========================================
// چیپ آمار (فقط در صفحه بازی‌ها — گام ۶)
// ========================================
function StatChip({
  icon: Icon,
  label,
  value,
  classes,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  classes: string;
}) {
  return (
    <div className={`rounded-xl border p-2.5 text-center ${classes}`}>
      <Icon className="w-4 h-4 mx-auto mb-1" />
      <motion.div
        key={value}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="text-lg font-extrabold leading-none"
      >
        {value}
      </motion.div>
      <div className="text-[10px] mt-1 opacity-80">{label}</div>
    </div>
  );
}

// ========================================
// صفحه بازی هنگ‌من
// ========================================
export default function GamePage() {
  // ---- وضعیت بازی ----
  const [phase, setPhase] = useState<Phase>("loading");
  const [words, setWords] = useState<HangmanWord[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [resultInfo, setResultInfo] = useState<{ won: boolean; bonus: number } | null>(null);

  // ---- آمار و استریک ----
  const [stats, setStats] = useState<GameStats | null>(null);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- ری‌استارت ----
  const [restartKey, setRestartKey] = useState(0);

  // ---- کلمه جاری ----
  const currentWord = words[wordIndex];
  const word = (currentWord?.word ?? "").toUpperCase();
  const wrongLetters = guessedLetters.filter((l) => !word.includes(l));
  const wrongCount = wrongLetters.length;
  const lives = MAX_WRONG - wrongCount;

  const figureStatus: FigureStatus =
    phase === "wordResult" && resultInfo
      ? resultInfo.won
        ? "won"
        : "lost"
      : "playing";

  // ========================================
  // بارگذاری کلمات و آمار
  // ========================================
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [wordsRes, statsRes] = await Promise.all([
          fetch(`/api/game/hangman/words?count=${WORDS_PER_SESSION}`),
          fetch("/api/game/hangman/result"),
        ]);

        if (!wordsRes.ok) throw new Error("words failed");

        const wordsData = await wordsRes.json();
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (!cancelled) {
            setStats(statsData.stats);
            setStreak(statsData.streak);
          }
        }

        if (cancelled) return;

        if (wordsData.words?.length) {
          setWords(wordsData.words);
          setPhase("playing");
        } else {
          setPhase("error");
        }
      } catch {
        if (!cancelled) setPhase("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [restartKey]);

  // ========================================
  // پایان یک کلمه (برد/باخت) + ثبت استریک
  // ========================================
  const finishWord = useCallback(
    async (won: boolean, bonus: number) => {
      setResults((r) => [...r, won]);
      setResultInfo({ won, bonus });
      setPhase("wordResult");

      // ✅ گام ۷: هر کلمه بازی، روزِ یادگیری رو هم ثبت می‌کنه
      try {
        const res = await fetch("/api/game/hangman/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "word", won }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.streak) setStreak(data.streak);
        }
      } catch {
        /* بی‌خیال — بازی ادامه دارد */
      }
    },
    [],
  );

  // ========================================
  // حدس زدن حرف
  // ========================================
  const handleGuess = useCallback(
    (letter: string) => {
      if (phase !== "playing" || !currentWord) return;
      if (guessedLetters.includes(letter)) return;

      const upperWord = currentWord.word.toUpperCase();
      const newGuessed = [...guessedLetters, letter];
      setGuessedLetters(newGuessed);

      const hit = upperWord.includes(letter);

      if (hit) {
        // امتیاز هر تکرار حرف
        const occurrences = upperWord
          .split("")
          .filter((l) => l === letter).length;
        setScore((s) => s + occurrences * POINTS_PER_LETTER);

        // چک برد
        const unique = new Set(upperWord.split(""));
        const complete = [...unique].every((l) => newGuessed.includes(l));
        if (complete) {
          const newWrong = newGuessed.filter(
            (g) => !upperWord.includes(g),
          ).length;
          const livesLeft = MAX_WRONG - newWrong;
          const bonus = WIN_BASE_BONUS + livesLeft * POINTS_PER_LIFE;
          setScore((s) => s + bonus);
          void finishWord(true, bonus);
        }
      } else {
        // چک باخت
        const newWrong = newGuessed.filter(
          (g) => !upperWord.includes(g),
        ).length;
        if (newWrong >= MAX_WRONG) {
          void finishWord(false, 0);
        }
      }
    },
    [phase, currentWord, guessedLetters, finishWord],
  );

  // ========================================
  // پایان دور — ثبت امتیاز نهایی
  // ========================================
  const submitSession = useCallback(async (finalScore: number) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/hangman/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "session", score: finalScore }),
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setIsNewRecord(data.isNewRecord);
      }
    } catch {
      /* خطا در ثبت — نمایش داده نمی‌شود */
    } finally {
      setSubmitting(false);
    }
  }, []);

  // ========================================
  // کلمه بعدی / پایان دور
  // ========================================
  const handleNextWord = useCallback(() => {
    if (wordIndex + 1 >= words.length) {
      setPhase("sessionEnd");
      void submitSession(score);
    } else {
      setWordIndex((i) => i + 1);
      setGuessedLetters([]);
      setResultInfo(null);
      setPhase("playing");
    }
  }, [wordIndex, words.length, score, submitSession]);

  // ========================================
  // بازی مجدد
  // ========================================
  const handleRestart = useCallback(() => {
    setWords([]);
    setWordIndex(0);
    setGuessedLetters([]);
    setScore(0);
    setResults([]);
    setResultInfo(null);
    setIsNewRecord(false);
    setPhase("loading");
    setRestartKey((k) => k + 1);
  }, []);

  // ========================================
  // پشتیبانی کیبورد فیزیکی
  // ========================================
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase === "wordResult") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextWord();
        }
        return;
      }
      if (phase !== "playing") return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, handleGuess, handleNextWord]);

  // ---- آمار این دور ----
  const sessionWins = results.filter(Boolean).length;
  const sessionLosses = results.length - sessionWins;
  const hasMoreWords = wordIndex + 1 < words.length;

  // ========================================
  // رندر
  // ========================================
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">بازی هنگ کلمه</h1>
          <p className="text-sm text-slate-500">
            حروف را حدس بزن و کلمه را نجات بده!
          </p>
        </div>
      </div>

      {/* ============ نوار آمار (فقط اینجا — گام ۶) ============ */}
      <div className="grid grid-cols-4 gap-2 mt-4 mb-5">
        <StatChip
          icon={Trophy}
          label="بهترین امتیاز"
          value={stats?.bestScore ?? 0}
          classes="bg-amber-50 border-amber-100 text-amber-600"
        />
        <StatChip
          icon={CheckCircle2}
          label="کلمات برده"
          value={stats?.totalWins ?? 0}
          classes="bg-emerald-50 border-emerald-100 text-emerald-600"
        />
        <StatChip
          icon={Gamepad2}
          label="دفعات بازی"
          value={stats?.sessionsPlayed ?? 0}
          classes="bg-blue-50 border-blue-100 text-blue-600"
        />
        <StatChip
          icon={Flame}
          label="روز متوالی"
          value={streak?.current ?? 0}
          classes="bg-orange-50 border-orange-100 text-orange-600"
        />
      </div>

      {/* ================= کارت بازی ================= */}
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* ---- نوار بالای کارت ---- */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-slate-700">
              کلمه {Math.min(wordIndex + 1, words.length || 1)} از{" "}
              {words.length || WORDS_PER_SESSION}
            </span>
            {/* نقاط پیشرفت کلمات */}
            {words.length > 0 && (
              <div className="flex items-center gap-1" dir="ltr">
                {words.map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={[
                      "w-2 h-2 rounded-full",
                      i < results.length
                        ? results[i]
                          ? "bg-emerald-500"
                          : "bg-red-400"
                        : i === wordIndex
                          ? "bg-amber-400 animate-pulse"
                          : "bg-slate-200",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* جان‌ها */}
            <div className="flex items-center gap-0.5" dir="ltr">
              {Array.from({ length: MAX_WRONG }).map((_, i) => (
                <motion.span
                  key={`${lives}-${i}`}
                  initial={i < lives ? { scale: 1.35 } : { scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Heart
                    className={[
                      "h-4 w-4",
                      i < lives
                        ? "text-red-500 fill-red-500"
                        : "text-slate-200 fill-slate-100",
                    ].join(" ")}
                  />
                </motion.span>
              ))}
            </div>
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

        {/* ---- بدنه بازی ---- */}
        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">در حال آماده‌سازی بازی...</p>
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
                  <HangmanFigure
                    wrongCount={wrongCount}
                    status={figureStatus}
                  />
                </div>

                {/* راهنما + کلمه */}
                <div className="order-1 md:order-2 space-y-4">
                  {/* باکس راهنما */}
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
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        {CATEGORY_LABELS[currentWord.category] ??
                          currentWord.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getGameLevel(currentWord.level).color}`}
                      >
                        {getGameLevel(currentWord.level).fa}
                      </span>
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
        <AnimatePresence>
          {phase === "wordResult" && resultInfo && (
            <motion.div
              className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {resultInfo.won && <Confetti />}
              <motion.div
                className="relative text-center space-y-3 max-w-xs w-full"
                initial={{ scale: 0.8, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="text-5xl"
                >
                  {resultInfo.won ? "🎉" : "😵"}
                </motion.div>
                <h3 className="text-lg font-bold text-slate-800">
                  {resultInfo.won
                    ? "آفرین! کلمه رو نجات دادی"
                    : "آخ! هنگ‌من کامل شد"}
                </h3>
                <p
                  dir="ltr"
                  className="text-2xl font-extrabold tracking-widest text-slate-700"
                >
                  {word}
                </p>
                <p className="text-sm text-slate-500">{currentWord?.hint}</p>
                {resultInfo.won && (
                  <motion.p
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-amber-600 font-bold text-sm flex items-center justify-center gap-1"
                  >
                    <Zap className="h-4 w-4" />
                    +{resultInfo.bonus} امتیاز پاداش
                  </motion.p>
                )}
                <motion.button
                  onClick={handleNextWord}
                  autoFocus
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-2 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {hasMoreWords ? "کلمه بعدی" : "دیدن نتیجه نهایی"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ اورلی پایان دور ============ */}
        <AnimatePresence>
          {phase === "sessionEnd" && (
            <motion.div
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {score > 0 && <Confetti count={32} />}
              <motion.div
                className="relative text-center space-y-4 max-w-sm w-full"
                initial={{ scale: 0.8, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {submitting ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">
                      در حال ثبت امتیاز...
                    </p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.1,
                        type: "spring",
                        stiffness: 260,
                      }}
                    >
                      <Trophy className="h-14 w-14 text-amber-400 mx-auto fill-amber-100" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-slate-800">
                      پایان دور!
                    </h3>

                    {isNewRecord && (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-xs font-bold"
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        رکورد جدید!
                      </motion.div>
                    )}

                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div>
                        <span className="text-slate-500">امتیاز کل: </span>
                        <span className="font-extrabold text-lg text-amber-600">
                          {score}
                        </span>
                      </div>
                      <div className="text-slate-200">|</div>
                      <div>
                        <span className="text-emerald-600 font-bold">
                          {sessionWins} برد
                        </span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-red-500 font-bold">
                          {sessionLosses} باخت
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span>
                        بهترین امتیاز:{" "}
                        <b className="text-slate-700">
                          {stats?.bestScore ?? 0}
                        </b>
                      </span>
                      {streak && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                          <b className="text-slate-700">{streak.current}</b> روز
                          متوالی
                        </span>
                      )}
                    </div>

                    <motion.button
                      onClick={handleRestart}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-2 px-6 py-3 bg-linear-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      بازی مجدد
                    </motion.button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* راهنمای امتیازدهی */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400 flex-wrap">
        <span>هر حرف درست: +{POINTS_PER_LETTER}</span>
        <span>پاداش برد کلمه: +{WIN_BASE_BONUS} تا +{WIN_BASE_BONUS + MAX_WRONG * POINTS_PER_LIFE}</span>
        <span>هر دور: {WORDS_PER_SESSION} کلمه</span>
      </div>
    </div>
  );
}
