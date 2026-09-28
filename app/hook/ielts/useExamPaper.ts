"use client";

import { useCallback, useEffect, useState } from "react";
import type { IeltsExamPaper, IeltsSkill } from "@/types/ielts";

// ========================================
// هوک برگهٔ امتحان (v1.0.3.6)
// واکشی برگهٔ ساخت‌یافتهٔ آزمون از متن PDF کتاب:
//   /api/ielts/paper?book=N&test=T&skill=S
// برگه = سوال‌های واقعی داخل PDF، به تفکیک بخش/پاساژ
// ========================================

export type ExamPaperState = {
  paper: IeltsExamPaper | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useExamPaper(
  bookId: number | null,
  testId: number | null,
  skill: IeltsSkill | null,
): ExamPaperState {
  const [paper, setPaper] = useState<IeltsExamPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!bookId || !testId || !skill) {
        setLoading(false);
        return;
      }
      void (async () => {
        try {
          setError(null);
          setLoading(true);
          const res = await fetch(
            `/api/ielts/paper?book=${bookId}&test=${testId}&skill=${skill}`,
          );
          if (!res.ok) throw new Error();
          setPaper((await res.json()) as IeltsExamPaper);
        } catch {
          setError("خطا در ساخت برگهٔ امتحان از PDF");
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => clearTimeout(t);
  }, [bookId, testId, skill, nonce]);

  return { paper, loading, error, refetch };
}
