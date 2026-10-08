"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { startAttempt, submitSelfScore, useAttempt } from "@/app/hook/ielts/useIelts";
import { recordStreakActivity } from "@/app/hook/ui/useStreak";
import type {
  IeltsAttemptPayload,
  IeltsMode,
  IeltsResultSummary,
  IeltsSkill,
  IeltsSubmitResult,
} from "@/types/ielts";

// ========================================
// هوک نشست آزمون پلیر عمومی (v1.0.4.2 — کلین‌کد)
// مدیریت کامل چرخهٔ تلاش در [skill]/page.tsx:
//  - بوت‌استرپ تلاش (گیت‌شده به «آماده‌شدن برگهٔ AI» — انصاف تایمر)
//  - همگام‌سازی نتیجهٔ تلاش‌های تحویل‌شدهٔ قبلی
//  - doSubmit + تحویل خودکار پایان زمان در حالت آزمون
//  - خودتصحیحی + شمارش پاسخ‌ها
// (از صفحهٔ ۱۱۶۶ خطی جدا شد — صفحه فقط چیدمان است)
// ========================================

const VALID_SKILLS: IeltsSkill[] = ["reading", "listening", "writing"];

export interface SkillExamSession {
  attemptId: string | null;
  payload: IeltsAttemptPayload | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  setAnswer: (questionId: string, value: string) => void;
  flush: () => Promise<void>;
  startError: string | null;
  result: IeltsSubmitResult | null;
  submittedView: IeltsResultSummary | null;
  doSubmit: () => Promise<void>;
  /** متادیتای مهارت جاری (تعداد سوال/دقیقه/بخش) */
  meta: { questions: number; minutes: number; parts: number };
  /** شناسهٔ سوال‌ها — r1..r40 / l1..l40 / w1,w2 */
  answerIds: string[];
  answeredCount: number;
  // خودتصحیحی
  selfScoreInput: string;
  setSelfScoreInput: (v: string) => void;
  doSelfScore: () => Promise<void>;
  selfScoreSaving: boolean;
  selfScoreError: string | null;
  selfScoreDone: { rawScore: number; bandScore: number } | null;
}

export function useSkillExamSession({
  bookId,
  testId,
  skill,
  paperLoading,
  paperGenerating,
}: {
  bookId: number;
  testId: number;
  skill: IeltsSkill;
  /** برگهٔ AI هنوز در حال بارگذاری/ساخت است → تلاش شروع نمی‌شود */
  paperLoading: boolean;
  paperGenerating: boolean;
}): SkillExamSession {
  const { tr } = useLanguage();

  const valid =
    Number.isInteger(bookId) &&
    bookId >= 1 &&
    bookId <= 8 &&
    Number.isInteger(testId) &&
    testId >= 1 &&
    testId <= 4 &&
    VALID_SKILLS.includes(skill);

  const sessionKey = `ielts-attempt-${bookId}-${testId}-${skill}`;
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [result, setResult] = useState<IeltsSubmitResult | null>(null);
  const [submittedView, setSubmittedView] = useState<IeltsResultSummary | null>(null);

  const elapsed0 = useRef(0);
  const submittedRef = useRef(false);

  // شروع تلاش هنگام ورود — فقط بعد از «آماده‌شدن برگه» (حالت از query string)
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window === "undefined") return;
      if (!valid) {
        setStartError(
          tr("آزمون یافت نشد (کتاب ۱..۸، تست ۱..۴)", "Test not found (book 1..8, test 1..4)"),
        );
        return;
      }
      // برگه هنوز در حال ساخت/بارگذاری است → صبر کنیم
      if (paperLoading || paperGenerating) return;
      const modeParam: IeltsMode =
        new URLSearchParams(window.location.search).get("mode") === "exam" ? "exam" : "practice";
      elapsed0.current = Date.now();
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        setAttemptId(stored);
        return;
      }
      void (async () => {
        const r = await startAttempt(bookId, testId, skill, modeParam);
        if (!r.ok) {
          setStartError(r.error);
          return;
        }
        sessionStorage.setItem(sessionKey, r.payload.attemptId);
        setAttemptId(r.payload.attemptId);
        // آیلتس بخشی از استریک روزانه است
        void recordStreakActivity();
      })();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, testId, skill, paperLoading, paperGenerating, valid]);

  const { payload, loading, error, saving, setAnswer, flush, submit } = useAttempt(attemptId);

  // اگر تلاش از قبل submitted باشد (بازگشت به صفحه) → نمای نتیجه
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

  // متادیتای مهارت جاری
  const meta = useMemo(() => {
    if (!payload) {
      return { questions: 40, minutes: 60, parts: skill === "listening" ? 4 : 3 };
    }
    if (skill === "reading") return { ...payload.reading };
    if (skill === "listening") return { ...payload.listening };
    return { questions: 2, minutes: payload.writing.minutes, parts: 0 };
  }, [payload, skill]);

  const answerIds = useMemo(() => {
    if (skill === "writing") return ["w1", "w2"];
    const prefix = skill === "reading" ? "r" : "l";
    return Array.from({ length: meta.questions }, (_, i) => `${prefix}${i + 1}`);
  }, [skill, meta.questions]);

  const answeredCount = useMemo(
    () => answerIds.filter((id) => (payload?.savedAnswers[id] ?? "").trim() !== "").length,
    [answerIds, payload],
  );

  // ارسال خودکار زمان صرف‌شده هنگام خروج (بدون تحویل)
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

  // ---------- خودتصحیحی (وقتی هیچ کلیدی نبود) ----------
  const [selfScoreInput, setSelfScoreInput] = useState("");
  const [selfScoreSaving, setSelfScoreSaving] = useState(false);
  const [selfScoreError, setSelfScoreError] = useState<string | null>(null);
  const [selfScoreDone, setSelfScoreDone] = useState<{
    rawScore: number;
    bandScore: number;
  } | null>(null);

  const doSelfScore = useCallback(async () => {
    if (!attemptId) return;
    const n = Number(selfScoreInput);
    if (!Number.isInteger(n) || n < 0 || n > (result?.totalQuestions ?? 40)) {
      setSelfScoreError(
        tr("عدد بین ۰ تا تعداد سوال وارد کن", "Enter a number between 0 and the question count"),
      );
      return;
    }
    setSelfScoreSaving(true);
    setSelfScoreError(null);
    const r = await submitSelfScore(attemptId, n);
    setSelfScoreSaving(false);
    if (!r) {
      setSelfScoreError(tr("ثبت نمره ناموفق بود — دوباره تلاش کن", "Saving failed — try again"));
      return;
    }
    setSelfScoreDone({ rawScore: r.rawScore, bandScore: r.bandScore });
  }, [attemptId, selfScoreInput, result, tr]);

  return {
    attemptId,
    payload,
    loading,
    error,
    saving,
    setAnswer,
    flush,
    startError,
    result,
    submittedView,
    doSubmit,
    meta,
    answerIds,
    answeredCount,
    selfScoreInput,
    setSelfScoreInput,
    doSelfScore,
    selfScoreSaving,
    selfScoreError,
    selfScoreDone,
  };
}
