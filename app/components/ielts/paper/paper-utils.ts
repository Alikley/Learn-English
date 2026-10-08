// ========================================
// ابزارهای مشترک برگهٔ امتحانی (v1.0.4.2)
// توابع خالص + تایپ‌های shared بین کامپوننت‌های paper/*
// (تفکیک از ExamPaper.tsx برای کلین‌کد — گام ۲ نسخهٔ 1.0.0.3)
// ========================================

import type { IeltsPaperQuestion } from "@/types/ielts";

/** یک گزینهٔ سوال — حرف + متن */
export type PaperOption = { letter: string; text: string };

/** نقشهٔ پاسخ‌های ثبت‌شده (کلید: r1..r40 / l1..l40) */
export type PaperAnswers = Record<string, string>;

/** callback ثبت پاسخ یک سوال */
export type OnPaperAnswer = (questionId: string, value: string) => void;

/** پیشوند شناسهٔ سوال بر اساس مهارت (r=reading, l=listening) */
export type QuestionPrefix = "r" | "l";

/** شناسهٔ یک سوال — مثلاً r5 / l12 */
export function questionId(prefix: QuestionPrefix, n: number): string {
  return `${prefix}${n}`;
}

/**
 * آیا مجموعهٔ حروف گزینه‌های سوال همان باکس مشترک بخش است؟
 * (گروه‌های باکسی/مچینگ — متن گزینه فقط یک بار بالای بخش می‌آید)
 */
export function sameLetterSet(
  a: PaperOption[] | undefined,
  b: PaperOption[] | undefined,
): boolean {
  if (!a || !b || a.length === 0 || a.length !== b.length) return false;
  const la = a.map((x) => x.letter).sort().join(",");
  const lb = b.map((x) => x.letter).sort().join(",");
  return la === lb;
}

/** دو رقمی کردن شمارهٔ کتاب/تست (4 → "04") */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** آیا سوال گزینهٔ قابل نمایش دارد؟ (حداقل ۲ گزینه) */
export function hasOptions(q: IeltsPaperQuestion): boolean {
  return !!q.options && q.options.length >= 2;
}

/** مقایسهٔ بدون حساسیت به بزرگی حروف — برای پاسخ حرفی */
export function letterEquals(answer: string, letter: string): boolean {
  return answer.trim().toUpperCase() === letter;
}
