import { requireAuth, ok, err } from "@/lib/api-helpers";
import { ensureUserRow } from "@/lib/ensure-user";
// v1.0.4.5 (English 1.0.0.9): تعداد کتاب از طول IELTS_BOOKS — مقاوم در برابر
// real-tests.ts قدیمی (رفع خطای بیلد Vercel)
import { getTestById } from "@/lib/ielts/real-tests";
import { buildAttemptPayload, examRemainingSec, skillMinutes } from "@/lib/ielts/attempt-payload";
import { prisma } from "@/prisma/prisma-client";
// v1.0.5.0 (English 1.0.1.0): ولیدیشن zod بدنه (سقف کتاب از
// IELTS_BOOKS.length داخل lib/validation.ts — قاعدهٔ مقاوم v1.0.4.5)
import { validateJson, attemptStartSchema } from "@/lib/validation";
import type { IeltsSkill, IeltsMode } from "@/types/ielts";

// ========================================
// POST /api/ielts/attempts — شروع یا ادامهٔ تلاش (v1.0.3.3)
// بدنه: { bookId: 1..۲۱, testId: 1..4, skill, mode }
//  - اگر تلاش ناتمام همان تست+مهارت وجود داشته باشد ادامه داده می‌شود
//  - پاسخ‌برگ + زمان باقی‌مانده + آدرس PDF/صوت برگردانده می‌شود
// ========================================

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // v1.0.5.0 — ولیدیشن zod (همان پیام‌های فارسی قبلی، حالا type-safe)
  const parsed = await validateJson(req, attemptStartSchema);
  if (!parsed.ok) return parsed.response;
  const { bookId, testId } = parsed.data;
  const skill = parsed.data.skill as IeltsSkill;
  const mode = parsed.data.mode as IeltsMode;

  const test = getTestById(bookId, testId);
  if (!test) return err("آزمون یافت نشد", 404);

  await ensureUserRow(auth.session);

  // ادامهٔ تلاش ناتمام همان تست+مهارت
  const existing = await prisma.ieltsAttempt.findFirst({
    where: {
      userId: auth.session.user.id,
      testSlug: test.slug,
      skill: skill.toUpperCase(),
      status: "IN_PROGRESS",
    },
    orderBy: { startedAt: "desc" },
  });

  let attempt = existing;
  if (!attempt) {
    attempt = await prisma.ieltsAttempt.create({
      data: {
        userId: auth.session.user.id,
        testSlug: test.slug,
        skill: skill.toUpperCase(),
        mode: mode.toUpperCase(),
      },
    });
  }

  const answers = await prisma.ieltsAnswer.findMany({
    where: { attemptId: attempt.id },
    select: { questionId: true, value: true },
  });
  const savedAnswers: Record<string, string> = {};
  for (const a of answers) savedAnswers[a.questionId] = a.value;

  const remainingSec = examRemainingSec(attempt, skillMinutes(skill, test));

  const payload = await buildAttemptPayload(attempt, savedAnswers, remainingSec);
  if (!payload) return err("آزمون یافت نشد", 404);
  return ok(payload);
}
