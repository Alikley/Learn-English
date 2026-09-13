"use client";

import { useCallback, useEffect, useState } from "react";
import { GAME_CONFIG } from "@/types/game";
import type { GameLevel, HangmanWord } from "@/types/game";
import type { FigureStatus } from "@/app/components/game/HangmanFigure";

// ========================================
// هوک منطق بازی هنگ‌من
// ماشین وضعیت: levelSelect → loading → playing → wordResult → sessionEnd
// تمام منطق (حدس، امتیاز، برد/باخت، دور بعدی) اینجاست؛
// صفحه فقط رندر می‌کند و با callback ها به useGameStats وصل می‌شود.
// ========================================

export type HangmanPhase =
  | "levelSelect"
  | "loading"
  | "playing"
  | "wordResult"
  | "sessionEnd"
  | "error";

type UseHangmanGameOptions = {
  // با پایان هر کلمه صدا زده می‌شود (برای ثبت استریک — گام ۷)
  onWordFinish?: (won: boolean) => void;
  // با پایان دور کامل صدا زده می‌شود (برای ثبت امتیاز)
  onSessionFinish?: (score: number) => void;
};

const { wordsPerSession, maxWrong, pointsPerLetter, winBaseBonus, pointsPerLife } =
  GAME_CONFIG;

export function useHangmanGame({
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

  // ---- کلید ری‌استارت دور (بازخوانی کلمات) ----
  const [sessionKey, setSessionKey] = useState(0);

  // ========================================
  // شروع بازی با سطح انتخابی
  // ========================================
  const startGame = useCallback((selected: GameLevel) => {
    setLevel(selected);
    setWords([]);
    setWordIndex(0);
    setGuessedLetters([]);
    setScore(0);
    setResults([]);
    setResultInfo(null);
    setPhase("loading");
    setSessionKey((k) => k + 1);
  }, []);

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
  const wrongCount = wrongLetters.length;
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
          const livesLeft = maxWrong - newWrong;
          const bonus = winBaseBonus + livesLeft * pointsPerLife;
          setScore((s) => s + bonus);
          finishWord(true, bonus);
        }
      } else {
        // چک باخت
        const newWrong = newGuessed.filter((g) => !upperWord.includes(g)).length;
        if (newWrong >= maxWrong) {
          finishWord(false, 0);
        }
      }
    },
    [phase, currentWord, guessedLetters, finishWord],
  );

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
      setPhase("playing");
    }
  }, [wordIndex, words.length, score, onSessionFinish]);

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
    setPhase("loading");
    setSessionKey((k) => k + 1);
  }, []);

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
    setPhase("levelSelect");
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
    // عملیات
    startGame,
    handleGuess,
    handleNextWord,
    handleRestart,
    handleBackToLevels,
  };
}
