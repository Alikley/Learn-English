"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  IeltsAttemptPayload,
  IeltsAttemptSummary,
  IeltsBookSummary,
  IeltsMode,
  IeltsScanInfo,
  IeltsSelfScoreResult,
  IeltsSkill,
  IeltsSubmitResult,
} from "@/types/ielts";

// ========================================
// هوک بخش آیلتس (v1.0.3.6)
// ارتباط با REST API اختصاصی /api/ielts/* — فهرست کتاب‌ها،
// جزئیات کتاب، شروع/ادامهٔ تلاش، ذخیرهٔ خودکار، تحویل،
// خودتصحیحی و اسکن مجدد باکت B2
// ========================================

export interface CambridgeBooksState {
  books: IeltsBookSummary[];
  scan: IeltsScanInfo | null;
  attempts: IeltsAttemptSummary[];
  loading: boolean;
  error: string | null;
  refetch: (refresh?: boolean) => Promise<void>;
}

/** فهرست ۸ کتاب کمبریج + وضعیت فایل‌های B2 + تلاش‌ها */
export function useCambridgeBooks(): CambridgeBooksState {
  const [books, setBooks] = useState<IeltsBookSummary[]>([]);
  const [scan, setScan] = useState<IeltsScanInfo | null>(null);
  const [attempts, setAttempts] = useState<IeltsAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    try {
      setError(null);
      const res = await fetch(`/api/ielts/books${refresh ? "?refresh=1" : ""}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBooks(data.books ?? []);
      setScan(data.scan ?? null);
      setAttempts(data.attempts ?? []);
    } catch {
      setError("خطا در دریافت فهرست کتاب‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  return { books, scan, attempts, loading, error, refetch: load };
}

export interface CambridgeBookDetail {
  book: IeltsBookSummary;
  files: IeltsBookSummary["files"];
  scan: IeltsScanInfo;
  attempts: IeltsAttemptSummary[];
}

export interface CambridgeBookState {
  detail: CambridgeBookDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** جزئیات یک کتاب + ۴ تست + تلاش‌های کاربر روی آن */
export function useCambridgeBook(bookId: number | null): CambridgeBookState {
  const [detail, setDetail] = useState<CambridgeBookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId) return;
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`/api/ielts/books/${bookId}`);
      if (!res.ok) throw new Error();
      setDetail(await res.json());
    } catch {
      setError("خطا در دریافت جزئیات کتاب");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

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

/** شروع یا ادامهٔ یک مهارت از یک تست */
export async function startAttempt(
  bookId: number,
  testId: number,
  skill: IeltsSkill,
  mode: IeltsMode,
): Promise<StartResult> {
  try {
    const res = await fetch("/api/ielts/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, testId, skill, mode }),
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

/** ثبت نمرهٔ خام خودتصحیحی */
export async function submitSelfScore(
  attemptId: string,
  rawScore: number,
): Promise<IeltsSelfScoreResult | null> {
  try {
    const res = await fetch(`/api/ielts/attempts/${attemptId}/self-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawScore }),
    });
    if (!res.ok) return null;
    return (await res.json()) as IeltsSelfScoreResult;
  } catch {
    return null;
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
      const data = (await res.json()) as IeltsAttemptPayload & Partial<IeltsSubmitResult>;
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
    async (elapsedSec: number, finalAnswers?: Record<string, string>): Promise<IeltsSubmitResult | null> => {
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
        return (await res.json()) as IeltsSubmitResult;
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
