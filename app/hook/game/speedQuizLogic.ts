// ========================================
// منطق خالص بازی کوییز سرعتی (v1.0.2.7 — ریفکتوری گام ۳)
// امتیاز پاسخ درست و چرخهٔ سطوح — بدون state
// ========================================

import { SPEEDQUIZ_CONFIG } from "@/types/game";
import type { GameLevel } from "@/types/game";

/** کلید تیک تایمر (میلی‌ثانیه) */
export const TICK_MS = 100;

/** مدت کل تایمر هر سوال (میلی‌ثانیه) */
export const QUESTION_TOTAL_MS = SPEEDQUIZ_CONFIG.secondsPerQuestion * 1000;

/** ترتیب سطوح برای «مرحله بعد» — چرخه‌ای تا پیشرفت بی‌پایان باشد */
export const LEVEL_ORDER: GameLevel[] = ["EASY", "MEDIUM", "HARD"];

/** سطح بعدی در چرخه */
export function nextLevelOf(level: GameLevel): GameLevel {
  const idx = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[(idx + 1) % LEVEL_ORDER.length];
}

/**
 * امتیاز یک پاسخ درست:
 * پایه + پاداش هر ثانیهٔ باقی‌مانده + پاداش کمبو
 */
export function correctAnswerGain(
  timeLeftMs: number,
  comboBefore: number,
): number {
  const secondsLeft = Math.ceil(timeLeftMs / 1000);
  return (
    SPEEDQUIZ_CONFIG.basePoints +
    secondsLeft * SPEEDQUIZ_CONFIG.timeBonusPerSecond +
    comboBefore * SPEEDQUIZ_CONFIG.comboStepBonus
  );
}

/**
 * امتیاز نهایی دور: اگر دور بی‌نقص بود (بدون غلط + جان کامل)
 * پاداش دور بی‌نقص اضافه می‌شود.
 */
export function finalSessionScore(
  score: number,
  wrongCount: number,
  lives: number,
): number {
  const perfect = wrongCount === 0 && lives === SPEEDQUIZ_CONFIG.lives;
  return score + (perfect ? SPEEDQUIZ_CONFIG.perfectSessionBonus : 0);
}

/** آدرس API سوال‌های کوییز سرعتی */
export function speedQuizQuestionsUrl(level: GameLevel): string {
  return `/api/game/speedquiz/questions?count=${SPEEDQUIZ_CONFIG.questionsPerSession}&level=${level}`;
}
