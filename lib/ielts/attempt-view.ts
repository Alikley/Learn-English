import { parseTestSlug } from "@/lib/ielts/real-tests";
import type { IeltsAttemptSummary } from "@/types/ielts";

// ========================================
// تبدیل ردیف IeltsAttempt دیتابیس به خلاصهٔ کلاینت (v1.0.3.3)
// شمارهٔ کتاب/تست از slug استخراج می‌شود — اسلاگ‌های قدیمی
// (v1.0.3.2: «cambridge-01») هم پشتیبانی می‌شوند.
// ========================================

type AttemptRow = {
  id: string;
  testSlug: string;
  skill: string;
  mode: string;
  status: string;
  rawScore: number | null;
  totalQuestions: number | null;
  bandScore: number | null;
  selfScored: boolean | null;
  startedAt: Date;
  submittedAt: Date | null;
  elapsedSec: number | null;
};

export function toAttemptSummary(a: AttemptRow): IeltsAttemptSummary {
  const parsed = parseTestSlug(a.testSlug);
  return {
    id: a.id,
    slug: a.testSlug,
    bookNumber: parsed?.bookNumber ?? 0,
    testNumber: parsed?.testNumber ?? 0,
    skill: a.skill.toLowerCase() as IeltsAttemptSummary["skill"],
    mode: a.mode.toLowerCase() as IeltsAttemptSummary["mode"],
    status: a.status as IeltsAttemptSummary["status"],
    rawScore: a.rawScore,
    totalQuestions: a.totalQuestions,
    bandScore: a.bandScore,
    selfScored: a.selfScored,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
    elapsedSec: a.elapsedSec,
  };
}

export const ATTEMPT_SELECT = {
  id: true,
  testSlug: true,
  skill: true,
  mode: true,
  status: true,
  rawScore: true,
  totalQuestions: true,
  bandScore: true,
  selfScored: true,
  startedAt: true,
  submittedAt: true,
  elapsedSec: true,
} as const;
