// ========================================
// ارزیابی محلی پاسخ‌های پادکست ایستا (بدون دیتابیس)
// (از صفحهٔ [podId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

import type { PodcastEpisode } from "@/types/training";
import type { StoredProgress } from "@/lib/practice-progress";
import type { ListeningSubmitResult } from "./ListeningResult";

/** نرمال‌سازی جواب برای مقایسه منصفانه */
export function normalizeAnswer(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2019\u02BC\u2018]/g, "'")
    .replace(/\s+/g, " ");
}

/**
 * ارزیابی جواب‌های قسمت ایستا: امتیاز، ستاره و XP
 * دقیقاً همان منطق قبلی صفحه — بدون تغییر رفتار
 */
export function evaluateStaticAnswers(
  item: PodcastEpisode,
  answers: Record<number, string>,
  prev: StoredProgress | null,
): ListeningSubmitResult {
  let correct = 0;
  for (const gap of item.gaps) {
    if (normalizeAnswer(answers[gap.id] || "") === normalizeAnswer(gap.answer))
      correct++;
  }
  const total = item.gaps.length;
  const percent = Math.round((correct / total) * 100);
  const stars = percent >= 80 ? 3 : percent >= 60 ? 2 : percent >= 40 ? 1 : 0;
  const xpEarned = Math.round((item.xp * stars) / 3);
  return {
    correct,
    total,
    stars,
    xpEarned,
    percent,
    bestResult: !!prev && prev.stars >= stars,
  };
}
