"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MEMORY_CONFIG, memoryWordCount } from "@/types/game";
import type { GameLevel, MemoryWordPair } from "@/types/game";
import {
  buildBoard,
  nextLevelOf,
  matchGain,
  boardCompletesWith,
  roundsFromWords,
  memoryWordsUrl,
} from "./memoryLogic";

// ========================================
// هوک منطق بازی حافظه کلمات
// ماشین وضعیت: levelSelect → loading → playing → roundResult → sessionEnd
// ساختار بازی: هر دور = چند راند (تخته) پشت سر هم؛
// هر راند = جفت‌های انگلیسی-فارسی روی تخته که باید مچ شوند.
//
// v1.0.0.7 — گام ۱: جان‌های پویا — هر جفت درست +۱ جان (تا سقف ۵)،
//   هر اشتباه −۱ جان؛ صفر شدن جان‌ها = Game Over (به‌جای «۳ اشتباه کل دور»)
// v1.0.0.7 — گام ۳: خروج وسط دور هم امتیاز را ثبت می‌کند
//   (قبلاً امتیاز دور نیمه‌تمام بی‌خیال می‌شد و کارت رکورد ۰ می‌ماند)
// v1.0.0.6 — گام ۳: برد (تمام‌کردن همه راندها) → دکمه «مرحله بعد» بدون شماره
// v1.0.0.6 — گام ۱: onSessionStart برای ثبت «دفعات بازی» هنگام شروع دور
// v1.0.2.7 — ریفکتوری: ساخت تخته/امتیاز/چرخهٔ سطح به memoryLogic.ts منتقل شد.
// ========================================

export type MemoryPhase =
  | "levelSelect"
  | "loading"
  | "playing"
  | "roundResult"
  | "sessionEnd"
  | "error";

// نتیجه نهایی دور (v1.0.0.6 — گام ۳)
export type MemoryOutcome = "win" | "gameover";

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
  // شروع یک دور جدید (برای ثبت دفعات بازی — گام ۱)
  onSessionStart?: () => void;
  // با هر جفت درست صدا زده می‌شود (برای ثبت استریک — گام ۷)
  onPairMatch?: () => void;
  // با پایان دور کامل صدا زده می‌شود (برای ثبت امتیاز)
  onSessionFinish?: (score: number, mistakes: number) => void;
};

export function useMemoryGame({
  onSessionStart,
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

  // ---- نتیجه نهایی دور (گام ۳) ----
  const [outcome, setOutcome] = useState<MemoryOutcome | null>(null);
  // ---- مخفی‌کردن نام سطح بعد از «مرحله بعد» (گام ۳) ----
  const [hideLevel, setHideLevel] = useState(false);

  // ---- جان‌های پویا (v1.0.0.7 — گام ۱) ----
  // شروع با startLives (۳)؛ هر جفت درست +۱ (تا سقف maxLives)، هر اشتباه −۱
  const [lives, setLives] = useState<number>(MEMORY_CONFIG.startLives);

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
  // ریست وضعیت یک دور — مشترک بین شروع/تلاش مجدد/بازگشت
  // ========================================
  const resetSession = useCallback(() => {
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
    setOutcome(null);
    setLives(MEMORY_CONFIG.startLives);
    setRoundIndex(0);
  }, []);

  // ========================================
  // شروع بازی با سطح انتخابی
  // hideLevel=true یعنی از مسیر «مرحله بعد» آمده‌ایم —
  // نام/شماره سطح هیچ‌جا نشان داده نمی‌شود (گام ۳)
  // ========================================
  const startGame = useCallback(
    (selected: GameLevel, opts?: { hideLevel?: boolean }) => {
      clearTimers();
      setLevel(selected);
      setHideLevel(Boolean(opts?.hideLevel));
      resetSession();
      setTotalRounds(MEMORY_CONFIG.roundsPerSession);
      setPhase("loading");
      setSessionKey((k) => k + 1);
      // ثبت دفعات بازی (گام ۱)
      onSessionStart?.();
    },
    [clearTimers, resetSession, onSessionStart],
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
        const res = await fetch(memoryWordsUrl(level, count));
        if (!res.ok) throw new Error("words failed");

        const data = await res.json();
        if (cancelled) return;

        const words: MemoryWordPair[] = data.words ?? [];

        // تعداد راندهای قابل ساخت از کلمات دریافتی
        const rounds = roundsFromWords(words, level);

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
  // جان‌های پویا (v1.0.0.7 — گام ۱) — state واقعی، نه مشتق‌شده
  const maxLives = MEMORY_CONFIG.maxLives;

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
  // پایان کل دور — برد یا Game Over (گام ۳)
  // ========================================
  const finishSession = useCallback(
    (result: MemoryOutcome, finalScore: number, finalMistakes: number) => {
      clearTimers();
      setOutcome(result);
      setPhase("sessionEnd");
      onSessionFinish?.(finalScore, finalMistakes);
    },
    [onSessionFinish, clearTimers],
  );

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
        setScore((s) => s + matchGain(combo));
        setCombo(nextCombo);
        setSessionMatches((m) => m + 1);
        // v1.0.0.7 — گام ۱: پاداش جفت درست — +۱ جان تا سقف maxLives
        setLives((l) => Math.min(MEMORY_CONFIG.maxLives, l + 1));

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
        if (boardCompletesWith(newCards, firstId, secondId)) {
          const t2 = window.setTimeout(() => {
            finishRound();
          }, 550);
          addTimer(t2);
        }
      } else {
        // ❌ ناهمسان — برگشت بعد از مکث
        setCombo(0);
        const newSessionMistakes = sessionMistakes + 1;
        setRoundMistakes((m) => m + 1);
        setSessionMistakes(newSessionMistakes);
        const newLives = lives - 1;
        setLives(newLives);
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

        // 🛑 گام ۱ (v1.0.0.7) — جان‌ها صفر شد → همان لحظه Game Over
        if (newLives <= 0) {
          const t3 = window.setTimeout(() => {
            finishSession("gameover", score, newSessionMistakes);
          }, MEMORY_CONFIG.flipBackDelayMs + 400);
          addTimer(t3);
        }
      }
    },
    [
      phase,
      flipped,
      wrongPair,
      cards,
      combo,
      lives,
      sessionMistakes,
      score,
      onPairMatch,
      addTimer,
      finishRound,
      finishSession,
    ],
  );

  // ========================================
  // راند بعدی / پایان دور (برد)
  // ========================================
  const handleNextRound = useCallback(() => {
    clearTimers();

    if (roundIndex + 1 >= totalRounds) {
      // ✅ همه راندها کامل شد — برد! (گام ۳)
      finishSession("win", score, sessionMistakes);
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
    clearTimers,
    finishSession,
  ]);

  // ========================================
  // مرحله بعد — سطح بعدی بدون نمایش شماره (گام ۳)
  // چرخه: آسان → متوسط → سخت → آسان (پیشرفت بی‌پایان)
  // ========================================
  const handleNextLevel = useCallback(() => {
    startGame(nextLevelOf(level), { hideLevel: true });
  }, [level, startGame]);

  // ========================================
  // بازی مجدد با همان سطح
  // ========================================
  const handleRestart = useCallback(() => {
    clearTimers();
    resetSession();
    setPhase("loading");
    setSessionKey((k) => k + 1);
    // ثبت دفعات بازی برای دور جدید (گام ۱)
    onSessionStart?.();
  }, [clearTimers, resetSession, onSessionStart]);

  // ========================================
  // بازگشت به انتخاب سطح
  // ========================================
  const handleBackToLevels = useCallback(() => {
    // v1.0.0.7 — گام ۳: امتیاز دورِ نیمه‌تمام قبل از ریست ثبت می‌شود
    const midSession = phase === "playing" || phase === "roundResult";
    if (midSession && (score > 0 || sessionMistakes > 0)) {
      onSessionFinish?.(score, sessionMistakes);
    }
    clearTimers();
    resetSession();
    setHideLevel(false);
    setPhase("levelSelect");
  }, [clearTimers, phase, score, sessionMistakes, onSessionFinish, resetSession]);

  return {
    // وضعیت
    phase,
    level,
    hideLevel,
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
    // نتیجه و جان‌ها (گام ۳)
    outcome,
    lives,
    maxLives,
    // عملیات
    startGame,
    handleCardClick,
    handleNextRound,
    handleNextLevel,
    handleRestart,
    handleBackToLevels,
  };
}
