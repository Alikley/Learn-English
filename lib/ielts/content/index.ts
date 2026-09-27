import type { IeltsTest, IeltsTestSummary } from "@/types/ielts";
import { book01 } from "./book-01";
import { book02 } from "./book-02";
import { book03 } from "./book-03";
import { book04 } from "./book-04";
import { book05 } from "./book-05";
import { book06 } from "./book-06";
import { book07 } from "./book-07";
import { book08 } from "./book-08";

// ========================================
// فهرست محتوای آیلتس — کمبریج ۱ تا ۸ (v1.0.3.2)
// محتوای تمرینی اختصاصی Flex English با فرمت دقیق آیلتس آکادمیک
// این ماژول فقط سمت سرور استفاده می‌شود (کلید پاسخ‌ها به کلاینت
// فقط در حالت تمرین یا بعد از تحویل آزمون ارسال می‌شود)
// ========================================

export const IELTS_TESTS: IeltsTest[] = [
  book01,
  book02,
  book03,
  book04,
  book05,
  book06,
  book07,
  book08,
];

/** یافتن آزمون با slug */
export function getTestBySlug(slug: string): IeltsTest | undefined {
  return IELTS_TESTS.find((t) => t.slug === slug);
}

/** خلاصهٔ امن آزمون برای ارسال به کلاینت (بدون محتوا و کلید) */
export function toSummary(t: IeltsTest): IeltsTestSummary {
  return {
    slug: t.slug,
    bookNumber: t.bookNumber,
    testNumber: t.testNumber,
    module: t.module,
    titleFa: t.titleFa,
    titleEn: t.titleEn,
    available: t.available,
    readingCount: t.reading.groups.reduce((n, g) => n + g.questions.length, 0),
    listeningCount: t.listening.groups.reduce((n, g) => n + g.questions.length, 0),
    writingTasks: t.writing.tasks.length,
    readingMinutes: t.reading.minutes,
    listeningMinutes: t.listening.minutes,
    writingMinutes: t.writing.minutes,
  };
}

/** شمارش سوال‌های یک مهارت */
export function countQuestions(t: IeltsTest, skill: "reading" | "listening"): number {
  return t[skill].groups.reduce((n, g) => n + g.questions.length, 0);
}

/** همهٔ سوال‌های یک مهارت به‌صورت مسطح */
export function flatQuestions(t: IeltsTest, skill: "reading" | "listening") {
  const out: {
    questionId: string;
    number: number;
    part: number;
    type: string;
    accepted: string[];
    answerDisplay: string;
    explanation?: string;
  }[] = [];
  for (const g of t[skill].groups) {
    for (const q of g.questions) {
      out.push({
        questionId: q.id,
        number: q.number,
        part: g.part,
        type: g.type,
        accepted: q.answer,
        answerDisplay: q.answerDisplay,
        explanation: q.explanation,
      });
    }
  }
  return out;
}
