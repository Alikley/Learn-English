"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  IeltsAttemptPayload,
  IeltsAttemptResult,
  IeltsAttemptSummary,
  IeltsMode,
  IeltsSkill,
  IeltsTestSummary,
} from "@/types/ielts";

// ========================================
// هوک بخش آیلتس (v1.0.3.2)
// ارتباط با API اختصاصی /api/ielts/* — فهرست کتاب‌ها، جزئیات آزمون،
// شروع/ادامهٔ تلاش، ذخیرهٔ خودکار، تحویل و واکشی نتیجه
// ========================================

export interface CambridgeBooksState {
  tests: IeltsTestSummary[];
  attempts: IeltsAttemptSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** فهرست کتاب‌های کمبریج + تلاش‌های کاربر */
export function useCambridgeBooks(): CambridgeBooksState {
  const [tests, setTests] = useState<IeltsTestSummary[]>([]);
  const [attempts, setAttempts] = useState<IeltsAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/ielts/cambridge");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTests(data.tests ?? []);
      setAttempts(data.attempts ?? []);
    } catch {
      setError("خطا در دریافت فهرست آزمون‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  return { tests, attempts, loading, error, refetch: load };
}

export interface CambridgeTestDetail {
  test: IeltsTestSummary;
  readingQuestions: number;
  listeningQuestions: number;
  readingTopics: string[];
  listeningTopics: string[];
  writingTaskTypes: string[];
  attempts: IeltsAttemptSummary[];
}

export interface CambridgeTestState {
  detail: CambridgeTestDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** جزئیات یک آزمون + تلاش‌های کاربر روی آن */
export function useCambridgeTest(slug: string | undefined): CambridgeTestState {
  const [detail, setDetail] = useState<CambridgeTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`/api/ielts/cambridge/${slug}`);
      if (!res.ok) throw new Error();
      setDetail(await res.json());
    } catch {
      setError("خطا در دریافت جزئیات آزمون");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  return { detail, loading, error, refetch: load };
}

/** نتیجهٔ شروع تلاش */
export type StartResult =
  | { ok: true; payload: IeltsAttemptPayload }
  | { ok: false; error: string };

/** شروع یا ادامهٔ یک مهارت */
export async function startAttempt(
  slug: string,
  skill: IeltsSkill,
  mode: IeltsMode,
): Promise<StartResult> {
  try {
    const res = await fetch("/api/ielts/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, skill, mode }),
    });
    if (res.status === 401) return { ok: false, error: "ابتدا وارد شوید" };
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "خطا در شروع آزمون" };
    }
    return { ok: true, payload: await res.json() };
  } catch {
    return { ok: false, error: "خطای شبکه" };
  }
}

/** مدیریت تلاش جاری داخل پلیر: واکشی، ذخیرهٔ خودکار، تحویل */
export function useAttempt(attemptId: string | null) {
  const [payload, setPayload] = useState<IeltsAttemptPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef<Record<string, string>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!attemptId) return;
    try {
      setError(null);
      const res = await fetch(`/api/ielts/attempts/${attemptId}`);
      if (!res.ok) throw new Error();
      const data: IeltsAttemptPayload & Partial<IeltsAttemptResult> = await res.json();
      setPayload(data);
      return data;
    } catch {
      setError("خطا در واکشی آزمون");
      return null;
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  /** ارسال پاسخ‌های کثیف به سرور — پیش از setAnswer تعریف می‌شود تا وابستگی‌ها درست باشند */
  const flush = useCallback(async () => {
    if (!attemptId || Object.keys(dirtyRef.current).length === 0) return;
    const body = { answers: { ...dirtyRef.current } };
    dirtyRef.current = {};
    try {
      setSaving(true);
      await fetch(`/api/ielts/attempts/${attemptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      /* ذخیرهٔ خودکار بی‌صدا شکست می‌خورد — دفعهٔ بعد دوباره */
    } finally {
      setSaving(false);
    }
  }, [attemptId]);

  /** ثبت پاسخ جدید + زمان‌بندی ذخیرهٔ خودکار (۸۰۰ms) */
  const setAnswer = useCallback(
    (questionId: string, value: string) => {
      setPayload((p) =>
        p ? { ...p, savedAnswers: { ...p.savedAnswers, [questionId]: value } } : p,
      );
      dirtyRef.current[questionId] = value;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flush(), 800);
    },
    [flush],
  );

  /** تحویل آزمون — نتیجهٔ کامل برگردانده می‌شود */
  const submit = useCallback(
    async (elapsedSec: number, finalAnswers?: Record<string, string>) => {
      if (!attemptId) return null;
      try {
        const res = await fetch(`/api/ielts/attempts/${attemptId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ elapsedSec, answers: finalAnswers }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "خطا در تحویل آزمون");
          return null;
        }
        return (await res.json()) as {
          skill: IeltsSkill;
          rawScore: number | null;
          totalQuestions: number | null;
          bandScore: number | null;
        };
      } catch {
        setError("خطای شبکه هنگام تحویل");
        return null;
      }
    },
    [attemptId],
  );

  // ذخیرهٔ ناچیز باقی‌مانده هنگام خروج
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { payload, loading, error, saving, setAnswer, flush, submit, reload: load };
}
