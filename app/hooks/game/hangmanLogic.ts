// ========================================
// منطق خالص بازی هنگ‌من (v1.0.2.7 — ریفکتوری گام ۳)
// توابع بدون state — قابل استفادهٔ مجدد و تست
// ========================================

import { GAME_CONFIG, HANGMAN_TIMER_SECONDS } from "@/types/game";
import type { GameLevel } from "@/types/game";

/** کلید تیک تایمر (میلی‌ثانیه) */
export const TIMER_TICK_MS = 100;

/** مدت کل تایمر یک حدس بر اساس سطح (میلی‌ثانیه) */
export function guessTimerMs(level: GameLevel): number {
  return HANGMAN_TIMER_SECONDS[level] * 1000;
}

/** تعداد تکرار یک حرف در کلمه */
export function countOccurrences(word: string, letter: string): number {
  return word.split("").filter((l) => l === letter).length;
}

/** آیا همهٔ حروف یکتای کلمه حدس زده شده‌اند؟ */
export function isWordGuessed(word: string, guessed: string[]): boolean {
  const unique = new Set(word.split(""));
  return [...unique].every((l) => guessed.includes(l));
}

/** تعداد حروف اشتباه از بین حدس‌ها */
export function wrongGuessCount(word: string, guessed: string[]): number {
  return guessed.filter((g) => !word.includes(g)).length;
}

/** پاداش برد: پایه + جانِ مانده × امتیاز هر جان */
export function winBonus(wrongGuesses: number, timeoutStrikes: number): number {
  const livesLeft = Math.max(
    0,
    GAME_CONFIG.maxWrong - wrongGuesses - timeoutStrikes,
  );
  return GAME_CONFIG.winBaseBonus + livesLeft * GAME_CONFIG.pointsPerLife;
}

/** آیا کلمه با حروف اشتباه + ضربه‌های زمانی باخته است؟ */
export function isLost(wrongGuesses: number, timeoutStrikes: number): boolean {
  return wrongGuesses + timeoutStrikes >= GAME_CONFIG.maxWrong;
}

/** ترتیب سطوح برای «مرحله بعد» — چرخه‌ای تا پیشرفت بی‌پایان باشد */
export const LEVEL_ORDER: GameLevel[] = ["EASY", "MEDIUM", "HARD"];

/** سطح بعدی در چرخه */
export function nextLevelOf(level: GameLevel): GameLevel {
  const idx = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[(idx + 1) % LEVEL_ORDER.length];
}

/** آدرس API کلمات هنگ‌من */
export function hangmanWordsUrl(level: GameLevel): string {
  return `/api/game/hangman/words?count=${GAME_CONFIG.wordsPerSession}&level=${level}`;
}
