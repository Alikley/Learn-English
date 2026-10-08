"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { startAttempt, useAttempt } from "@/app/hook/ielts/useIelts";
import { recordStreakActivity } from "@/app/hook/ui/useStreak";
import { partQuestionNumbers, type StructuredExam, type StructGap } from "@/lib/ielts/structured-tests";
import type {
  IeltsAttemptPayload,
  IeltsMode,
  IeltsResultSummary,
  IeltsSkill,
  IeltsSubmitResult,
} from "@/types/ielts";

// ========================================
// هوک نشست آزمون ساخت‌یافته (v1.0.4.2 — کلین‌کد)
// مدیریت چرخهٔ تلاش در part/[part]/page.tsx:
//  - بوت‌استرپ (حالت/فول از query) + تایمر مشترک بین Partها
//  - پرچم‌های «مرور بعدی» (sessionStorage)
//  - setGap/gapValue (سوال ۱۱ دو تکه دارد) + doSubmit + goPart
// (از صفحهٔ ۱۱۲۴ خطی جدا شد — صفحه فقط چیدمان است)
// ========================================

/** ذخیرهٔ محلی پرچم‌های «مرور بعدی» سوال‌ها */
function loadReviewFlags(key: string): Record<number, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? "{}") as Record<number, boolean>;
  } catch {
    return {};
  }
}

export interface StructuredPartSession {
  payload: IeltsAttemptPayload | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  startError: string | null;
  mode: IeltsMode;
  isFull: boolean;
  /** ثانیه‌های صرف‌شده از ابتدای آزمون (مبنای مشترک تایمر) */
  initialElapsed: number;
  result: IeltsSubmitResult | null;
  submittedView: IeltsResultSummary | null;
  doSubmit: () => Promise<void>;
  /** همهٔ شمارهٔ سوال‌های آزمون (مرتب) */
  allNums: number[];
  answered: (q: number) => boolean;
  answeredCount: number;
  setGap: (gap: StructGap, value: string) => void;
  gapValue: (gap: StructGap) => string;
  reviewFlags: Record<number, boolean>;
  toggleFlag: (q: number | null) => void;
  activeQuestion: number | null;
  setActiveQuestion: (q: number) => void;
  scrollToQuestion: (q: number) => void;
  goPart: (n: number) => void;
  flush: () => Promise<void>;
}

export function useStructuredPartSession({
  bookId,
  testId,
  skill,
  partNum,
  exam,
  validPart,
}: {
  bookId: number;
  testId: number;
  skill: IeltsSkill;
  partNum: number;
  exam: StructuredExam | null;
  validPart: boolean;
}): StructuredPartSession {
  const router = useRouter();

  const sessionKey = `ielts-attempt-${bookId}-${testId}-${skill}`;
  const flagsKey = `ielts-review-flags-${bookId}-${testId}-${skill}`;
  const timerKey = `ielts-timer-${bookId}-${testId}-${skill}`;
  const resultKey = `ielts-result-${bookId}-${testId}-${skill}`;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [result, setResult] = useState<IeltsSubmitResult | null>(null);
  const [submittedView, setSubmittedView] = useState<IeltsResultSummary | null>(null);
  const [mode, setMode] = useState<IeltsMode>("practice");
  const [isFull, setIsFull] = useState(false);
  const [reviewFlags, setReviewFlags] = useState<Record<number, boolean>>({});
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [initialElapsed, setInitialElapsed] = useState(0);

  const elapsed0 = useRef(0);
  const submittedRef = useRef(false);

  // شروع/ادامهٔ تلاش + خواندن حالت از query string
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      setMode(params.get("mode") === "exam" ? "exam" : "practice");
      setIsFull(params.get("full") === "1");
      setReviewFlags(loadReviewFlags(flagsKey));

      if (!exam) {
        // برگهٔ ساخت‌یافته‌ای نیست → پلیر عمومی (PDF)
        router.replace(`/ielts/cambridge/${bookId}/${testId}/${skill}`);
        return;
      }
      if (!validPart) {
        router.replace(`/ielts/cambridge/${bookId}/${testId}/${skill}/part/1`);
        return;
      }
      elapsed0.current = Date.now();
      // مبنای تایمر مشترک بین Partها — اولین ورود به آزمون ثبت می‌شود
      let base = Number(sessionStorage.getItem(timerKey) || 0);
      if (!Number.isFinite(base) || base <= 0) {
        base = Date.now();
        try {
          sessionStorage.setItem(timerKey, String(base));
        } catch {
          /* حافظهٔ نشست پر است */
        }
      }
      setInitialElapsed(Math.max(0, Math.floor((Date.now() - base) / 1000)));
      // اگر همین آزمون قبلاً تحویل شده → نمای نتیجه (نه شروع مجدد)
      const resultAttempt = sessionStorage.getItem(resultKey);
      if (resultAttempt) {
        setAttemptId(resultAttempt);
        return;
      }
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        setAttemptId(stored);
        return;
      }
      void (async () => {
        const modeParam: IeltsMode = params.get("mode") === "exam" ? "exam" : "practice";
        const r = await startAttempt(bookId, testId, skill, modeParam);
        if (!r.ok) {
          setStartError(r.error);
          return;
        }
        sessionStorage.setItem(sessionKey, r.payload.attemptId);
        setAttemptId(r.payload.attemptId);
        setMode(r.payload.mode);
        void recordStreakActivity();
      })();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, testId, skill, partNum]);

  const { payload, loading, error, saving, setAnswer, flush, submit } = useAttempt(attemptId);

  // اگر تلاش قبلاً submitted باشد → نمای نتیجه
  useEffect(() => {
    if (payload?.status !== "SUBMITTED" || result) return;
    const t = setTimeout(() => {
      const p = payload as unknown as Partial<IeltsResultSummary>;
      setSubmittedView({
        rawScore: p.rawScore ?? null,
        totalQuestions: p.totalQuestions ?? null,
        bandScore: p.bandScore ?? null,
        selfScored: p.selfScored ?? null,
      });
    }, 0);
    return () => clearTimeout(t);
  }, [payload, result]);

  const allNums = useMemo(
    () =>
      exam
        ? exam.parts
            .flatMap((p) => partQuestionNumbers(exam, p.part))
            .sort((a, b) => a - b)
        : [],
    [exam],
  );

  /** آیا سوال q پاسخ داده شده؟ (سوال ۱۱ دو جای خالی دارد) */
  const answered = useCallback(
    (q: number) => {
      if (!payload) return false;
      if (q === 11) {
        return Boolean(
          (payload.savedAnswers["l11-1"] ?? "").trim() &&
            (payload.savedAnswers["l11-2"] ?? "").trim(),
        );
      }
      return (payload.savedAnswers[`l${q}`] ?? "").trim() !== "";
    },
    [payload],
  );

  const answeredCount = useMemo(
    () => allNums.filter((q) => answered(q)).length,
    [allNums, answered],
  );

  // پاسخ یک جای خالی — سوال ۱۱ دو تکه دارد که ترکیب می‌شود
  const setGap = useCallback(
    (gap: StructGap, value: string) => {
      if (gap.q === 11 && gap.sub) {
        setAnswer(`l11-${gap.sub}`, value);
        const other =
          gap.sub === 1 ? (payload?.savedAnswers["l11-2"] ?? "") : (payload?.savedAnswers["l11-1"] ?? "");
        const v1 = gap.sub === 1 ? value : other;
        const v2 = gap.sub === 2 ? value : other;
        setAnswer("l11", `${v1} ${v2}`.trim());
        return;
      }
      setAnswer(`l${gap.q}`, value);
    },
    [setAnswer, payload],
  );

  const gapValue = useCallback(
    (gap: StructGap): string => {
      if (gap.q === 11 && gap.sub) return payload?.savedAnswers[`l11-${gap.sub}`] ?? "";
      return payload?.savedAnswers[`l${gap.q}`] ?? "";
    },
    [payload],
  );

  const toggleFlag = useCallback(
    (q: number | null) => {
      if (q === null) return;
      setReviewFlags((prev) => {
        const next = { ...prev, [q]: !prev[q] };
        try {
          sessionStorage.setItem(flagsKey, JSON.stringify(next));
        } catch {
          /* حافظهٔ نشست پر است */
        }
        return next;
      });
    },
    [flagsKey],
  );

  // ارسال زمان صرف‌شده هنگام خروج
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  const doSubmit = useCallback(async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    await flush();
    const elapsedSec = elapsed0.current ? Math.floor((Date.now() - elapsed0.current) / 1000) : 0;
    const finalAnswers = payload?.savedAnswers ?? {};
    const r = await submit(elapsedSec, finalAnswers);
    if (r) {
      setResult(r);
      setSubmittedView(null);
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem(timerKey);
      // نگه‌داشتن نشانهٔ نتیجه — بازگشت به Partها نتیجه را نشان می‌دهد
      try {
        sessionStorage.setItem(resultKey, attemptId);
      } catch {
        /* حافظهٔ نشست پر است */
      }
    } else {
      submittedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, flush, payload, submit]);

  // پایان زمان در حالت آزمون → تحویل خودکار
  useEffect(() => {
    if (payload?.mode === "exam" && payload.remainingSec === 0 && !submittedRef.current && !result) {
      void doSubmit();
    }
  }, [payload, doSubmit, result]);

  const goPart = useCallback(
    (n: number) => {
      if (!exam || n < 1 || n > exam.parts.length || n === partNum) return;
      void flush();
      const q = new URLSearchParams();
      if (mode === "exam") q.set("mode", "exam");
      if (isFull) q.set("full", "1");
      router.push(
        `/ielts/cambridge/${bookId}/${testId}/${skill}/part/${n}${q.toString() ? `?${q}` : ""}`,
      );
    },
    [exam, partNum, flush, mode, isFull, router, bookId, testId, skill],
  );

  const scrollToQuestion = useCallback((q: number) => {
    setActiveQuestion(q);
    document.getElementById(`q-${q}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      document.getElementById(`input-q-${q}`)?.focus();
    }, 350);
  }, []);

  return {
    payload,
    loading,
    error,
    saving,
    startError,
    mode,
    isFull,
    initialElapsed,
    result,
    submittedView,
    doSubmit,
    allNums,
    answered,
    answeredCount,
    setGap,
    gapValue,
    reviewFlags,
    toggleFlag,
    activeQuestion,
    setActiveQuestion,
    scrollToQuestion,
    goPart,
    flush,
  };
}
