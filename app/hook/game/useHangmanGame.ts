"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_CONFIG, HANGMAN_TIMER_SECONDS } from "@/types/game";
import type { GameLevel, HangmanWord } from "@/types/game";
import type { FigureStatus } from "@/app/components/game/hangman/HangmanFigure";
import {
  TIMER_TICK_MS,
  guessTimerMs,
  countOccurrences,
  isWordGuessed,
  wrongGuessCount,
  winBonus,
  isLost,
  hangmanWordsUrl,
} from "./hangmanLogic";

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
// v1.0.2.7 — ریفکتوری: منطق خالص (امتیاز/برد/باخت/تایمر)
// به hangmanLogic.ts منتقل شد.
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
  const [timeLeftMs, setTimeLeftMs] = useState<number>(guessTimerMs("EASY"));
  // ضربه‌های زمانی — هر بار که زمان تمام شود یکی اضافه می‌شود
  // (یک تکه از هنگ‌من بدون حدسِ اشتباه تکمیل می‌شود)
  const [timeoutStrikes, setTimeoutStrikes] = useState(0);

  // ---- کلید ری‌استارت دور (بازخوانی کلمات) ----
  const [sessionKey, setSessionKey] = useState(0);

  // ---- کل زمان تایمر سطح فعلی ----
  const timerTotalMs = guessTimerMs(level);

  // ========================================
  // ریست وضعیت یک دور — مشترک بین شروع/تلاش مجدد/بازگشت
  // ========================================
  const resetRound = useCallback((lvl: GameLevel) => {
    setWords([]);
    setWordIndex(0);
    setGuessedLetters([]);
    setScore(0);
    setResults([]);
    setResultInfo(null);
    setTimeLeftMs(guessTimerMs(lvl));
    setTimeoutStrikes(0);
  }, []);

  // ========================================
  // شروع بازی با سطح انتخابی
  // ========================================
  const startGame = useCallback(
    (selected: GameLevel) => {
      setLevel(selected);
      resetRound(selected);
      setPhase("loading");
      setSessionKey((k) => k + 1);
      // ثبت دفعات بازی (گام ۱)
      onSessionStart?.();
    },
    [resetRound, onSessionStart],
  );

  // ========================================
  // بارگذاری کلمات سطح انتخابی
  // ========================================
  useEffect(() => {
    if (sessionKey === 0) return; // هنوز بازی‌ای شروع نشده

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(hangmanWordsUrl(level));
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
  const lives = GAME_CONFIG.maxWrong - wrongCount;

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
      setTimeLeftMs(guessTimerMs(level));

      const hit = upperWord.includes(letter);

      if (hit) {
        // امتیاز هر تکرار حرف
        setScore((s) => s + countOccurrences(upperWord, letter) * GAME_CONFIG.pointsPerLetter);

        // چک برد
        if (isWordGuessed(upperWord, newGuessed)) {
          const newWrong = wrongGuessCount(upperWord, newGuessed);
          const bonus = winBonus(newWrong, timeoutStrikes);
          setScore((s) => s + bonus);
          finishWord(true, bonus);
        }
      } else {
        // چک باخت — حروف اشتباه + ضربه‌های زمانی
        const newWrong = wrongGuessCount(upperWord, newGuessed);
        if (isLost(newWrong, timeoutStrikes)) {
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
    setTimeLeftMs(guessTimerMs(level));

    // اگر تکه‌ها کامل شد → کلمه باخت
    if (isLost(wrongLetters.length, nextStrikes)) {
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
      setTimeLeftMs(guessTimerMs(level));
      setTimeoutStrikes(0);
      setPhase("playing");
    }
  }, [wordIndex, words.length, score, level, onSessionFinish]);

  // ========================================
  // بازی مجدد با همان سطح
  // ========================================
  const handleRestart = useCallback(() => {
    resetRound(level);
    setPhase("loading");
    setSessionKey((k) => k + 1);
    // ثبت دفعات بازی برای دور جدید (گام ۱)
    onSessionStart?.();
  }, [resetRound, level, onSessionStart]);

  // ========================================
  // بازگشت به انتخاب سطح
  // ========================================
  const handleBackToLevels = useCallback(() => {
    // v1.0.0.7 — گام ۳: امتیاز دورِ نیمه‌تمام قبل از ریست ثبت می‌شود
    const midSession = phase === "playing" || phase === "wordResult";
    if (midSession && score > 0) {
      onSessionFinish?.(score);
    }
    resetRound(level);
    setPhase("levelSelect");
  }, [phase, score, onSessionFinish, level, resetRound]);

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
