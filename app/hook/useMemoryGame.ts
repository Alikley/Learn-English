"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MEMORY_CONFIG, memoryWordCount } from "@/types/game";
import type { GameLevel, MemoryWordPair } from "@/types/game";

// ========================================
// هوک منطق بازی حافظه کلمات
// ماشین وضعیت: levelSelect → loading → playing → roundResult → sessionEnd
// ساختار بازی: هر دور = چند راند (تخته) پشت سر هم؛
// هر راند = جفت‌های انگلیسی-فارسی روی تخته که باید مچ شوند.
// تمام منطق (فلیپ، مچ، کمبو، امتیاز، راند بعدی) اینجاست؛
// صفحه فقط رندر می‌کند و با callback ها به useMemoryStats وصل می‌شود.
// ========================================

export type MemoryPhase =
  | "levelSelect"
  | "loading"
  | "playing"
  | "roundResult"
  | "sessionEnd"
  | "error";

// ---- یک کارت روی تخته ----
export type MemoryCardItem = {
  cardId: number;
  pairId: number;
  side: "en" | "fa";
  text: string;
  state: "down" | "up" | "matched";
};

// ---- خلاصه نتیجه یک راند (برای اورلی) ----
export type MemoryRoundInfo = {
  round: number;
  mistakes: number;
  perfect: boolean;
  bonus: number;
};

type UseMemoryGameOptions = {
  // با هر جفت درست صدا زده می‌شود (برای ثبت استریک — گام ۷)
  onPairMatch?: () => void;
  // با پایان دور کامل صدا زده می‌شود (برای ثبت امتیاز)
  onSessionFinish?: (score: number, mistakes: number) => void;
};

// ========================================
// ساخت تخته یک راند: جفت‌ها → کارت‌های شافل‌شده
// ========================================
function buildBoard(
  pairs: MemoryWordPair[],
  level: GameLevel,
  roundIndex: number,
): MemoryCardItem[] {
  const per = MEMORY_CONFIG.pairsPerBoard[level];
  const roundPairs = pairs.slice(roundIndex * per, (roundIndex + 1) * per);

  const cards: MemoryCardItem[] = [];
  for (const p of roundPairs) {
    cards.push({
      cardId: 0,
      pairId: p.id,
      side: "en",
      text: p.word,
      state: "down",
    });
    cards.push({
      cardId: 0,
      pairId: p.id,
      side: "fa",
      text: p.translation,
      state: "down",
    });
  }

  // ---- شافل تصادفی (Fisher–Yates) ----
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  cards.forEach((c, i) => {
    c.cardId = i;
  });
  return cards;
}

export function useMemoryGame({
  onPairMatch,
  onSessionFinish,
}: UseMemoryGameOptions = {}) {
  // ---- وضعیت بازی ----
  const [phase, setPhase] = useState<MemoryPhase>("levelSelect");
  const [level, setLevel] = useState<GameLevel>("EASY");
  const [pairs, setPairs] = useState<MemoryWordPair[]>([]);
  const [totalRounds, setTotalRounds] = useState<number>(
    MEMORY_CONFIG.roundsPerSession,
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [cards, setCards] = useState<MemoryCardItem[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<number[] | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState(0);
  const [sessionMatches, setSessionMatches] = useState(0);
  const [roundInfo, setRoundInfo] = useState<MemoryRoundInfo | null>(null);

  // ---- کلید ری‌استارت دور (بازخوانی کلمات) ----
  const [sessionKey, setSessionKey] = useState(0);

  // ---- مدیریت تایمرهای در انتظار (فلیپ‌بک و مچ) ----
  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
  }, []);
  const addTimer = useCallback((t: number) => {
    timersRef.current.push(t);
  }, []);

  // پاکسازی تایمرها هنگام unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ========================================
  // شروع بازی با سطح انتخابی
  // ========================================
  const startGame = useCallback(
    (selected: GameLevel) => {
      clearTimers();
      setLevel(selected);
      setPairs([]);
      setCards([]);
      setFlipped([]);
      setWrongPair(null);
      setScore(0);
      setCombo(0);
      setRoundMistakes(0);
      setSessionMistakes(0);
      setSessionMatches(0);
      setRoundInfo(null);
      setRoundIndex(0);
      setTotalRounds(MEMORY_CONFIG.roundsPerSession);
      setPhase("loading");
      setSessionKey((k) => k + 1);
    },
    [clearTimers],
  );

  // ========================================
  // بارگذاری جفت کلمات سطح انتخابی
  // ========================================
  useEffect(() => {
    if (sessionKey === 0) return; // هنوز بازی‌ای شروع نشده

    let cancelled = false;

    async function load() {
      try {
        const count = memoryWordCount(level);
        const res = await fetch(
          `/api/game/memory/words?count=${count}&level=${level}`,
        );
        if (!res.ok) throw new Error("words failed");

        const data = await res.json();
        if (cancelled) return;

        const words: MemoryWordPair[] = data.words ?? [];
        const per = MEMORY_CONFIG.pairsPerBoard[level];

        // تعداد راندهای قابل ساخت از کلمات دریافتی
        const rounds = Math.max(
          0,
          Math.min(MEMORY_CONFIG.roundsPerSession, Math.floor(words.length / per)),
        );

        if (rounds > 0) {
          setPairs(words);
          setTotalRounds(rounds);
          setCards(buildBoard(words, level, 0));
          setFlipped([]);
          setWrongPair(null);
          setCombo(0);
          setRoundMistakes(0);
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
  const totalPairs = cards.length / 2;
  const matchedPairs =
    cards.filter((c) => c.state === "matched").length / 2;
  const hasMoreRounds = roundIndex + 1 < totalRounds;

  // ========================================
  // پایان یک راند (همه جفت‌ها مچ شدند)
  // ========================================
  const finishRound = useCallback(() => {
    const perfect = roundMistakes === 0;
    const bonus = perfect ? MEMORY_CONFIG.perfectRoundBonus : 0;
    if (bonus > 0) setScore((s) => s + bonus);
    setRoundInfo({
      round: roundIndex + 1,
      mistakes: roundMistakes,
      perfect,
      bonus,
    });
    setPhase("roundResult");
  }, [roundIndex, roundMistakes]);

  // ========================================
  // کلیک روی یک کارت
  // ========================================
  const handleCardClick = useCallback(
    (cardId: number) => {
      if (phase !== "playing") return;
      if (flipped.length >= 2 || wrongPair) return;

      const card = cards.find((c) => c.cardId === cardId);
      if (!card || card.state !== "down") return;

      const newFlipped = [...flipped, cardId];
      const newCards = cards.map((c) =>
        c.cardId === cardId ? { ...c, state: "up" as const } : c,
      );
      setCards(newCards);
      setFlipped(newFlipped);

      // ---- هنوز فقط یک کارت باز است ----
      if (newFlipped.length < 2) return;

      // ---- دو کارت باز شد — مقایسه ----
      const [firstId, secondId] = newFlipped;
      const first = newCards.find((c) => c.cardId === firstId)!;
      const second = newCards.find((c) => c.cardId === secondId)!;

      if (first.pairId === second.pairId) {
        // ✅ جفت درست — امتیاز + کمبو
        const nextCombo = combo + 1;
        const gained =
          MEMORY_CONFIG.pointsPerMatch +
          (nextCombo - 1) * MEMORY_CONFIG.comboStepBonus;
        setScore((s) => s + gained);
        setCombo(nextCombo);
        setSessionMatches((m) => m + 1);

        // ثبت استریک با هر جفت درست (گام ۷)
        onPairMatch?.();

        // کارت‌ها بعد از یک مکث کوتاه matched می‌شوند
        const t1 = window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.cardId === firstId || c.cardId === secondId
                ? { ...c, state: "matched" as const }
                : c,
            ),
          );
          setFlipped([]);
        }, 350);
        addTimer(t1);

        // چک اتمام راند
        const boardComplete = newCards.every(
          (c) =>
            c.state === "matched" ||
            c.cardId === firstId ||
            c.cardId === secondId,
        );
        if (boardComplete) {
          const t2 = window.setTimeout(() => {
            finishRound();
          }, 550);
          addTimer(t2);
        }
      } else {
        // ❌ ناهمسان — برگشت بعد از مکث
        setCombo(0);
        setRoundMistakes((m) => m + 1);
        setSessionMistakes((m) => m + 1);
        setWrongPair([firstId, secondId]);

        const t = window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.cardId === firstId || c.cardId === secondId
                ? { ...c, state: "down" as const }
                : c,
            ),
          );
          setFlipped([]);
          setWrongPair(null);
        }, MEMORY_CONFIG.flipBackDelayMs);
        addTimer(t);
      }
    },
    [phase, flipped, wrongPair, cards, combo, onPairMatch, addTimer, finishRound],
  );

  // ========================================
  // راند بعدی / پایان دور
  // ========================================
  const handleNextRound = useCallback(() => {
    clearTimers();

    if (roundIndex + 1 >= totalRounds) {
      setPhase("sessionEnd");
      onSessionFinish?.(score, sessionMistakes);
    } else {
      const next = roundIndex + 1;
      setRoundIndex(next);
      setCards(buildBoard(pairs, level, next));
      setFlipped([]);
      setWrongPair(null);
      setCombo(0);
      setRoundMistakes(0);
      setRoundInfo(null);
      setPhase("playing");
    }
  }, [
    roundIndex,
    totalRounds,
    pairs,
    level,
    score,
    sessionMistakes,
    onSessionFinish,
    clearTimers,
  ]);

  // ========================================
  // بازی مجدد با همان سطح
  // ========================================
  const handleRestart = useCallback(() => {
    clearTimers();
    setCards([]);
    setFlipped([]);
    setWrongPair(null);
    setScore(0);
    setCombo(0);
    setRoundMistakes(0);
    setSessionMistakes(0);
    setSessionMatches(0);
    setRoundInfo(null);
    setRoundIndex(0);
    setPhase("loading");
    setSessionKey((k) => k + 1);
  }, [clearTimers]);

  // ========================================
  // بازگشت به انتخاب سطح
  // ========================================
  const handleBackToLevels = useCallback(() => {
    clearTimers();
    setPairs([]);
    setCards([]);
    setFlipped([]);
    setWrongPair(null);
    setScore(0);
    setCombo(0);
    setRoundMistakes(0);
    setSessionMistakes(0);
    setSessionMatches(0);
    setRoundInfo(null);
    setRoundIndex(0);
    setPhase("levelSelect");
  }, [clearTimers]);

  return {
    // وضعیت
    phase,
    level,
    pairs,
    totalRounds,
    roundIndex,
    cards,
    flipped,
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
    // عملیات
    startGame,
    handleCardClick,
    handleNextRound,
    handleRestart,
    handleBackToLevels,
  };
}
