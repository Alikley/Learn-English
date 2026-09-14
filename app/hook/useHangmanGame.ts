"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_CONFIG, HANGMAN_TIMER_SECONDS } from "@/types/game";
import type { GameLevel, HangmanWord } from "@/types/game";
import type { FigureStatus } from "@/app/components/game/HangmanFigure";

// ========================================
// هوک منطق بازی هنگ‌من
// ماشین وضعیت: levelSelect → loading → playing → wordResult → sessionEnd
// تمام منطق (حدس، امتیاز، برد/باخت، دور بعدی) اینجاست؛
// صفحه فقط رندر می‌کند و با callback ها به useGameStats وصل می‌شود.
//
// v1.0.0.6 — گام ۲: تایمر حدس حرف بر اساس سطح
//   آسان ۵ / متوسط ۷ / سخت ۱۰ ثانیه — اگر زمان تمام شود
//   بدون حدس، یک تکه از هنگ‌من تکمیل می‌شود (ضربه زمانی)
//   و تایمر دوباره پر می‌شود؛ با تکمیل همه تکه‌ها کلمه باخت است.
// v1.0.0.6 — گام ۱: onSessionStart برای ثبت «دفعات بازی» هنگام شروع دور
// ========================================

export type HangmanPhase =
  | "levelSelect"
  | "loading"
  | "playing"
  | "wordResult"
  | "sessionEnd"
  | "error";

type UseHangmanGameOptions = {
  // شروع یک دور جدید (برای ثبت دفعات بازی — گام ۱)
  onSessionStart?: () => void;
  // با پایان هر کلمه صدا زده می‌شود (برای ثبت استریک — گام ۷)
  onWordFinish?: (won: boolean) => void;
  // با پایان دور کامل صدا زده می‌شود (برای ثبت امتیاز)
  onSessionFinish?: (score: number) => void;
};

const { wordsPerSession, maxWrong, pointsPerLetter, winBaseBonus, pointsPerLife } =
  GAME_CONFIG;

const TIMER_TICK_MS = 100;

export function useHangmanGame({
  onSessionStart,
  onWordFinish,
  onSessionFinish,
}: UseHangmanGameOptions = {}) {
  // ---- وضعیت بازی ----
  const [phase, setPhase] = useState<HangmanPhase>("levelSelect");
  const [level, setLevel] = useState<GameLevel>("EASY");
  const [words, setWords] = useState<HangmanWord[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [resultInfo, setResultInfo] = useState<{ won: boolean; bonus: number } | null>(null);

  // ---- تایمر حدس (گام ۲) ----
  // زمان باقی‌مانده برای حدس حرف فعلی
  const [timeLeftMs, setTimeLeftMs] = useState<number>(
    HANGMAN_TIMER_SECONDS.EASY * 1000,
  );
  // ضربه‌های زمانی — هر بار که زمان تمام شود یکی اضافه می‌شود
  // (یک تکه از هنگ‌من بدون حدسِ اشتباه تکمیل می‌شود)
  const [timeoutStrikes, setTimeoutStrikes] = useState(0);

  // ---- کلید ری‌استارت دور (بازخوانی کلمات) ----
  const [sessionKey, setSessionKey] = useState(0);

  // ---- کل زمان تایمر سطح فعلی ----
  const timerTotalMs = HANGMAN_TIMER_SECONDS[level] * 1000;

  // ========================================
  // شروع بازی با سطح انتخابی
  // ========================================
  const startGame = useCallback(
    (selected: GameLevel) => {
      setLevel(selected);
      setWords([]);
      setWordIndex(0);
      setGuessedLetters([]);
      setScore(0);
      setResults([]);
      setResultInfo(null);
      // تایمر و ضربه‌های زمانی از ابتدا (گام ۲)
      setTimeLeftMs(HANGMAN_TIMER_SECONDS[selected] * 1000);
      setTimeoutStrikes(0);
      setPhase("loading");
      setSessionKey((k) => k + 1);
      // ثبت دفعات بازی (گام ۱)
      onSessionStart?.();
    },
    [onSessionStart],
  );

  // ========================================
  // بارگذاری کلمات سطح انتخابی
  // ========================================
  useEffect(() => {
    if (sessionKey === 0) return; // هنوز بازی‌ای شروع نشده

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/game/hangman/words?count=${wordsPerSession}&level=${level}`,
        );
        if (!res.ok) throw new Error("words failed");

        const data = await res.json();
        if (cancelled) return;

        if (data.words?.length) {
          setWords(data.words);
          setPhase("playing");
        } else {
          setPhase("error");
        }
      } catch {
        if (!cancelled) setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionKey, level]);

  // ========================================
  // مقادیر مشتق‌شده
  // ========================================
  const currentWord = words[wordIndex];
  const word = (currentWord?.word ?? "").toUpperCase();
  const wrongLetters = guessedLetters.filter((l) => !word.includes(l));
  // تعداد تکه‌های تکمیل‌شده = حروف اشتباه + ضربه‌های زمانی (گام ۲)
  const wrongCount = wrongLetters.length + timeoutStrikes;
  const lives = maxWrong - wrongCount;

  const figureStatus: FigureStatus =
    phase === "wordResult" && resultInfo
      ? resultInfo.won
        ? "won"
        : "lost"
      : "playing";

  const sessionWins = results.filter(Boolean).length;
  const sessionLosses = results.length - sessionWins;
  const hasMoreWords = wordIndex + 1 < words.length;

  // ========================================
  // پایان یک کلمه (برد/باخت)
  // ========================================
  const finishWord = useCallback(
    (won: boolean, bonus: number) => {
      setResults((r) => [...r, won]);
      setResultInfo({ won, bonus });
      setPhase("wordResult");
      onWordFinish?.(won);
    },
    [onWordFinish],
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

      // با هر حدس، تایمر دوباره پر می‌شود (گام ۲)
      setTimeLeftMs(HANGMAN_TIMER_SECONDS[level] * 1000);

      const hit = upperWord.includes(letter);

      if (hit) {
        // امتیاز هر تکرار حرف
        const occurrences = upperWord
          .split("")
          .filter((l) => l === letter).length;
        setScore((s) => s + occurrences * pointsPerLetter);

        // چک برد
        const unique = new Set(upperWord.split(""));
        const complete = [...unique].every((l) => newGuessed.includes(l));
        if (complete) {
          const newWrong = newGuessed.filter((g) => !upperWord.includes(g)).length;
          const livesLeft = Math.max(0, maxWrong - newWrong - timeoutStrikes);
          const bonus = winBaseBonus + livesLeft * pointsPerLife;
          setScore((s) => s + bonus);
          finishWord(true, bonus);
        }
      } else {
        // چک باخت — حروف اشتباه + ضربه‌های زمانی
        const newWrong = newGuessed.filter((g) => !upperWord.includes(g)).length;
        if (newWrong + timeoutStrikes >= maxWrong) {
          finishWord(false, 0);
        }
      }
    },
    [phase, currentWord, guessedLetters, timeoutStrikes, level, finishWord],
  );

  // ========================================
  // اتمام زمان حدس — یک تکه هنگ‌من تکمیل می‌شود (گام ۲)
  // ========================================
  const handleTimeout = useCallback(() => {
    if (phase !== "playing" || !currentWord) return;

    const nextStrikes = timeoutStrikes + 1;
    setTimeoutStrikes(nextStrikes);
    // تایمر برای حدس بعدی دوباره پر می‌شود
    setTimeLeftMs(HANGMAN_TIMER_SECONDS[level] * 1000);

    // اگر تکه‌ها کامل شد → کلمه باخت
    if (wrongLetters.length + nextStrikes >= maxWrong) {
      finishWord(false, 0);
    }
  }, [
    phase,
    currentWord,
    timeoutStrikes,
    wrongLetters,
    level,
    finishWord,
  ]);

  // ---- دسترسی همیشه‌به‌روز به handleTimeout (برای افکت تایم‌اوت) ----
  const handleTimeoutRef = useRef(handleTimeout);
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  // ---- تیک تایمر (فقط حین بازی) ----
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setTimeLeftMs((t) => (t <= TIMER_TICK_MS ? 0 : t - TIMER_TICK_MS));
    }, TIMER_TICK_MS);
    return () => window.clearInterval(id);
  }, [phase, wordIndex]);

  // ---- زمان تمام شد → ضربه زمانی ----
  useEffect(() => {
    if (phase === "playing" && timeLeftMs <= 0) {
      handleTimeoutRef.current();
    }
  }, [timeLeftMs, phase]);

  // ========================================
  // کلمه بعدی / پایان دور
  // ========================================
  const handleNextWord = useCallback(() => {
    if (wordIndex + 1 >= words.length) {
      setPhase("sessionEnd");
      onSessionFinish?.(score);
    } else {
      setWordIndex((i) => i + 1);
      setGuessedLetters([]);
      setResultInfo(null);
      // تایمر و ضربه‌ها برای کلمه جدید از ابتدا (گام ۲)
      setTimeLeftMs(HANGMAN_TIMER_SECONDS[level] * 1000);
      setTimeoutStrikes(0);
      setPhase("playing");
    }
  }, [wordIndex, words.length, score, level, onSessionFinish]);

  // ========================================
  // بازی مجدد با همان سطح
  // ========================================
  const handleRestart = useCallback(() => {
    setWords([]);
    setWordIndex(0);
    setGuessedLetters([]);
    setScore(0);
    setResults([]);
    setResultInfo(null);
    setTimeLeftMs(HANGMAN_TIMER_SECONDS[level] * 1000);
    setTimeoutStrikes(0);
    setPhase("loading");
    setSessionKey((k) => k + 1);
    // ثبت دفعات بازی برای دور جدید (گام ۱)
    onSessionStart?.();
  }, [level, onSessionStart]);

  // ========================================
  // بازگشت به انتخاب سطح
  // ========================================
  const handleBackToLevels = useCallback(() => {
    setWords([]);
    setWordIndex(0);
    setGuessedLetters([]);
    setScore(0);
    setResults([]);
    setResultInfo(null);
    setTimeLeftMs(HANGMAN_TIMER_SECONDS[level] * 1000);
    setTimeoutStrikes(0);
    setPhase("levelSelect");
  }, [level]);

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

  return {
    // وضعیت
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
    // تایمر (گام ۲)
    timeLeftMs,
    timerTotalMs,
    levelSeconds: HANGMAN_TIMER_SECONDS[level],
    timeoutStrikes,
    // عملیات
    startGame,
    handleGuess,
    handleNextWord,
    handleRestart,
    handleBackToLevels,
  };
}
