// ========================================
// منطق خالص بازی حافظه کلمات (v1.0.2.7 — ریفکتوری گام ۳)
// ساخت تخته، امتیاز جفت و چرخهٔ سطوح — بدون state
// ========================================

import { MEMORY_CONFIG } from "@/types/game";
import type { GameLevel, MemoryWordPair } from "@/types/game";
import type { MemoryCardItem } from "./useMemoryGame";

/** ترتیب سطوح برای «مرحله بعد» — چرخه‌ای تا پیشرفت بی‌پایان باشد */
export const LEVEL_ORDER: GameLevel[] = ["EASY", "MEDIUM", "HARD"];

/** سطح بعدی در چرخه */
export function nextLevelOf(level: GameLevel): GameLevel {
  const idx = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[(idx + 1) % LEVEL_ORDER.length];
}

// ========================================
// ساخت تخته یک راند: جفت‌ها → کارت‌های شافل‌شده
// ========================================
export function buildBoard(
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

/** امتیاز یک جفت درست با احتساب کمبو */
export function matchGain(comboBefore: number): number {
  return (
    MEMORY_CONFIG.pointsPerMatch + comboBefore * MEMORY_CONFIG.comboStepBonus
  );
}

/** آیا با باز شدن دو کارتِ داده‌شده، تخته کامل می‌شود؟ */
export function boardCompletesWith(
  cards: MemoryCardItem[],
  firstId: number,
  secondId: number,
): boolean {
  return cards.every(
    (c) =>
      c.state === "matched" ||
      c.cardId === firstId ||
      c.cardId === secondId,
  );
}

/** تعداد راندهای قابل ساخت از کلمات دریافتی */
export function roundsFromWords(
  words: MemoryWordPair[],
  level: GameLevel,
): number {
  const per = MEMORY_CONFIG.pairsPerBoard[level];
  return Math.max(
    0,
    Math.min(MEMORY_CONFIG.roundsPerSession, Math.floor(words.length / per)),
  );
}

/** آدرس API کلمات حافظه */
export function memoryWordsUrl(level: GameLevel, count: number): string {
  return `/api/game/memory/words?count=${count}&level=${level}`;
}
