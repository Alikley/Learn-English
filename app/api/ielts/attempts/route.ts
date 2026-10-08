import { requireAuth, ok, err } from "@/lib/api-helpers";
import { ensureUserRow } from "@/lib/ensure-user";
import { getTestById, IELTS_MAX_BOOK } from "@/lib/ielts/real-tests";
import { buildAttemptPayload, examRemainingSec, skillMinutes } from "@/lib/ielts/attempt-payload";
import { prisma } from "@/prisma/Prisma client";
import type { IeltsSkill, IeltsMode } from "@/types/ielts";

// ========================================
// POST /api/ielts/attempts — شروع یا ادامهٔ تلاش (v1.0.3.3)
// بدنه: { bookId: 1..21, testId: 1..4, skill, mode }
//  - اگر تلاش ناتمام همان تست+مهارت وجود داشته باشد ادامه داده می‌شود
//  - پاسخ‌برگ + زمان باقی‌مانده + آدرس PDF/صوت برگردانده می‌شود
// ========================================

const SKILLS = ["reading", "listening", "writing"] as const;
const MODES = ["practice", "exam"] as const;

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  let body: { bookId?: unknown; testId?: unknown; skill?: unknown; mode?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("درخواست نامعتبر است");
  }

  const bookId = Number(body.bookId);
  const testId = Number(body.testId);
  const skill = String(body.skill ?? "") as IeltsSkill;
  const mode = String(body.mode ?? "") as IeltsMode;

  if (!Number.isInteger(bookId) || bookId < 1 || bookId > IELTS_MAX_BOOK)
    return err(`شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_MAX_BOOK})`);
  if (!Number.isInteger(testId) || testId < 1 || testId > 4)
    return err("شناسهٔ تست نامعتبر است (۱ تا ۴)");
  if (!SKILLS.includes(skill)) return err("مهارت نامعتبر است");
  if (!MODES.includes(mode)) return err("حالت نامعتبر است");

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
