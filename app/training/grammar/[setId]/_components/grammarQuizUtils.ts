// ========================================
// ابزارهای خالص کوییز گرامری
// (از صفحهٔ [setId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export type LogItem = {
  id: number;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  question: string;
};

/** نرمال‌سازی جواب نوشتاری */
export function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2019\u02BC\u2018]/g, "'")
    .replace(/\s+/g, " ");
}

/** تبدیل درصد به ستاره */
export function starsOf(percent: number) {
  if (percent >= 80) return 3;
  if (percent >= 60) return 2;
  if (percent >= 40) return 1;
  return 0;
}
