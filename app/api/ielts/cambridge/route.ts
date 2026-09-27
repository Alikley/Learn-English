import { requireAuth, ok } from "@/lib/api-helpers";
import { IELTS_TESTS, toSummary } from "@/lib/ielts/content";
import { prisma } from "@/prisma/Prisma client";
import type { IeltsAttemptSummary } from "@/types/ielts";

// ========================================
// GET /api/ielts/cambridge — فهرست کتاب‌های کمبریج (v1.0.3.2)
// آدرس API اختصاصی بخش آیلتس: خلاصهٔ هر کتاب + آخرین وضعیت کاربر
// ========================================

function toAttemptSummary(a: {
  id: string;
  skill: string;
  mode: string;
  status: string;
  rawScore: number | null;
  totalQuestions: number | null;
  bandScore: number | null;
  startedAt: Date;
  submittedAt: Date | null;
  elapsedSec: number | null;
  testSlug: string;
}): IeltsAttemptSummary {
  return {
    id: a.id,
    slug: a.testSlug,
    skill: a.skill.toLowerCase() as IeltsAttemptSummary["skill"],
    mode: a.mode.toLowerCase() as IeltsAttemptSummary["mode"],
    status: a.status as IeltsAttemptSummary["status"],
    rawScore: a.rawScore,
    totalQuestions: a.totalQuestions,
    bandScore: a.bandScore,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
    elapsedSec: a.elapsedSec,
  };
}

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const attempts = await prisma.ieltsAttempt.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { startedAt: "desc" },
    select: {
      id: true, skill: true, mode: true, status: true,
      rawScore: true, totalQuestions: true, bandScore: true,
      startedAt: true, submittedAt: true, elapsedSec: true, testSlug: true,
    },
  });

  return ok({
    tests: IELTS_TESTS.map(toSummary),
    attempts: attempts.map(toAttemptSummary),
  });
}
