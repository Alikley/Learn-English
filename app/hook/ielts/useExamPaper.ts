"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IeltsExamPaper, IeltsSkill } from "@/types/ielts";

// ========================================
// هوک برگهٔ امتحان (v1.0.4.0)
// واکشی برگهٔ ساخت‌یافتهٔ آزمون:
//   /api/ielts/paper?book=N&test=T&skill=S
//
// جدید: اگر برگه در حال ساخت با هوش مصنوعی باشد
// ({ ok:false, generating:true })، هر ۵ ثانیه poll
// می‌شود تا برگه آماده شود — تولید فقط «یک بار» در
// سرور انجام می‌شود و برای همیشه کش می‌گردد.
// ========================================

const POLL_MS = 5000;
/** حداکثر ~۱۰ دقیقه poll — بعد از آن به کاربر خطا + دکمهٔ retry */
const MAX_POLL_TRIES = 120;

export type ExamPaperState = {
  paper: IeltsExamPaper | null;
  loading: boolean;
  /** true = برگه با AI در حال ساخت است (اولین بازدید این آزمون) */
  generating: boolean;
  error: string | null;
  /** تلاش مجدد — با refresh=true کش دائمی AI شکسته و دوباره ساخته می‌شود */
  refetch: (refresh?: boolean) => void;
};

export function useExamPaper(
  bookId: number | null,
  testId: number | null,
  skill: IeltsSkill | null,
): ExamPaperState {
  const [paper, setPaper] = useState<IeltsExamPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  /** refresh فقط برای «اولین» درخواستِ این چرخه فرستاده می‌شود —
   *  pollهای بعدی عادی هستند وگرنه تولید بی‌نهایت تکرار می‌شد */
  const refreshRef = useRef(false);
  const triesRef = useRef(0);

  const refetch = useCallback((refresh = false) => {
    refreshRef.current = refresh;
    triesRef.current = 0;
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!bookId || !testId || !skill) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      const refresh = refreshRef.current;
      refreshRef.current = false;

      try {
        setError(null);
        setLoading(true);
        const res = await fetch(
          `/api/ielts/paper?book=${bookId}&test=${testId}&skill=${skill}${refresh ? "&refresh=1" : ""}`,
        );
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as IeltsExamPaper;
        if (cancelled) return;

        // ---- برگه در حال ساخت با AI → poll ----
        if (data.ok === false && data.generating === true) {
          setPaper(null);
          setGenerating(true);
          triesRef.current += 1;
          if (triesRef.current >= MAX_POLL_TRIES) {
            setGenerating(false);
            setLoading(false);
            setError("ساخت برگه بیش از حد طول کشید — کمی بعد دوباره وارد این آزمون شو");
            return;
          }
          pollTimer = setTimeout(() => void tick(), POLL_MS);
          return;
        }

        // ---- برگه آماده (یا شکست نهایی) ----
        setGenerating(false);
        setPaper(data);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setGenerating(false);
        setError("خطا در ساخت برگهٔ امتحان از PDF");
        setLoading(false);
      }
    };

    const startTimer = setTimeout(() => void tick(), 0);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [bookId, testId, skill, nonce]);

  return { paper, loading, generating, error, refetch };
}
