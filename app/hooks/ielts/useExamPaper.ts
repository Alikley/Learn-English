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
  /** v1.0.6.1 — آخرین درصد پیشرفت واقعی از سرور (null = ثبت نشده) */
  progress: { pct: number; at: number } | null;
  /** v1.0.6.1 — شروع چرخهٔ ساخت جاری از دید کلاینت (ms) — برای تخمین درصد */
  generatingSince: number | null;
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
  const [progress, setProgress] = useState<{ pct: number; at: number } | null>(null);
  const [generatingSince, setGeneratingSince] = useState<number | null>(null);
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
      // v1.0.6.0 (English 1.0.1.3): setState هم‌زمان داخل effect ممنوع
      // شده (قانون eslint-config-next 16.2.6) — در تایمر 0ms
      // زمان‌بندی می‌شود؛ رفتار دیده‌شده تغییری نکرده.
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
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
          setProgress(data.progress ?? null);
          // شروع چرخهٔ ساخت از دید کلاینت — فقط بار اول ثبت می‌شود
          // (چرخهٔ بعدی مثل retry-after-failure دوباره از صفر شروع می‌شود)
          setGeneratingSince((prev) => prev ?? Date.now());
          triesRef.current += 1;
          if (triesRef.current >= MAX_POLL_TRIES) {
            setGenerating(false);
            setLoading(false);
            setGeneratingSince(null);
            setProgress(null);
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
        setGeneratingSince(null);
        setProgress(null);
      } catch {
        if (cancelled) return;
        setGenerating(false);
        setError("خطا در ساخت برگهٔ امتحان از PDF");
        setLoading(false);
        setGeneratingSince(null);
        setProgress(null);
      }
    };

    const startTimer = setTimeout(() => void tick(), 0);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [bookId, testId, skill, nonce]);

  return { paper, loading, generating, error, progress, generatingSince, refetch };
}
