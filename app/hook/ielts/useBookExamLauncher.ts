"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { startAttempt } from "@/app/hook/ielts/useIelts";
import { getStructuredExam } from "@/lib/ielts/structured-tests";
import type { IeltsMode, IeltsSkill } from "@/types/ielts";

// ========================================
// هوک شروع آزمون از صفحهٔ کتاب (v1.0.4.2 — کلین‌کد)
// startAttempt + ناوبری به پلیر مناسب (ساخت‌یافته/عمومی)
// + پاک‌سازی نتیجهٔ نشست قبلی همان مهارت
// (از [book]/page.tsx جدا شد)
// ========================================

export function useBookExamLauncher(bookId: number, valid: boolean) {
  const router = useRouter();
  /** کلید دکمهٔ در حال اجرا — مثل "3-reading-exam" */
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const begin = useCallback(
    async (testId: number, skill: IeltsSkill, mode: IeltsMode, full = false) => {
      if (!valid) return;
      setStarting(`${testId}-${skill}-${mode}${full ? "-full" : ""}`);
      setStartError(null);
      const r = await startAttempt(bookId, testId, skill, mode);
      setStarting(null);
      if (!r.ok) {
        setStartError(r.error);
        return;
      }
      // شروع تمرین جدید → نمای نتیجهٔ قبلی کنار برود
      try {
        sessionStorage.removeItem(`ielts-result-${bookId}-${testId}-${skill}`);
      } catch {
        /* حافظهٔ نشست پر است */
      }
      // آزمون‌های ساخت‌یافته → پلیر Part‌محور؛ بقیه → پلیر عمومی
      const query = `mode=${mode}${full ? `&full=1` : ""}`;
      const structured = getStructuredExam(bookId, testId, skill) !== null;
      router.push(
        structured
          ? `/ielts/cambridge/${bookId}/${testId}/${skill}/part/1?${query}`
          : `/ielts/cambridge/${bookId}/${testId}/${skill}?${query}`,
      );
    },
    [bookId, valid, router],
  );

  return { starting, startError, begin };
}
