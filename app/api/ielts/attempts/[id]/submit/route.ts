import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getTestBySlug, flatQuestions } from "@/lib/ielts/content";
import { isAnswerCorrect, rawToBand } from "@/lib/ielts/grade";
import { prisma } from "@/prisma/Prisma client";

// ========================================
// POST /api/ielts/attempts/[id]/submit — تحویل و تصحیح (v1.0.3.2)
//  - ریدینگ/لیسنینگ: تصحیح خودکار + نمرهٔ خام + بند
//  - رایتینگ: ذخیرهٔ متن‌ها + شمارش کلمه (خودارزیابی با چک‌لیست)
//  - elapsedSec از سمت کلاینت (زمان صرف‌شدهٔ واقعی)
// ========================================

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const attempt = await prisma.ieltsAttempt.findUnique({
    where: { id },
    include: { answers: true },
  });
  if (!attempt) return err("تلاش یافت نشد", 404);
  if (attempt.userId !== auth.session.user.id) return err("دسترسی ندارید", 403);
  if (attempt.status === "SUBMITTED") return err("این آزمون قبلاً تحویل شده است");

  const test = getTestBySlug(attempt.testSlug);
  if (!test) return err("آزمون یافت نشد", 404);

  let body: { elapsedSec?: number; answers?: Record<string, string> } = {};
  try {
    body = await req.json();
  } catch {
    /* بدنهٔ خالی مجاز است */
  }

  // پاسخ‌های نهایی ارسالی (اگر هست) با ذخیره‌های قبلی ادغام می‌شود
  const savedAnswers: Record<string, string> = {};
  for (const a of attempt.answers) savedAnswers[a.questionId] = a.value;
  if (body.answers && typeof body.answers === "object") {
    for (const [qid, v] of Object.entries(body.answers)) {
      if (typeof v === "string" && qid.length <= 20) savedAnswers[qid] = v.slice(0, 20000);
    }
  }

  const skill = attempt.skill.toLowerCase();
  const elapsedSec =
    typeof body.elapsedSec === "number" && body.elapsedSec >= 0
      ? Math.min(Math.floor(body.elapsedSec), 60 * 60 * 6)
      : Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

  let rawScore: number | null = null;
  let totalQuestions: number | null = null;
  let bandScore: number | null = null;

  if (skill === "reading" || skill === "listening") {
    const questions = flatQuestions(test, skill);
    totalQuestions = questions.length;
    rawScore = 0;

    // تراکنش: ذخیرهٔ نهایی پاسخ‌ها + علامت درستی + به‌روزرسانی تلاش
    await prisma.$transaction(async (tx) => {
      for (const q of questions) {
        const yours = savedAnswers[q.questionId] ?? "";
        const correct = isAnswerCorrect(yours, q.accepted);
        if (correct) rawScore = (rawScore ?? 0) + 1;
        await tx.ieltsAnswer.upsert({
          where: {
            attemptId_questionId: { attemptId: attempt.id, questionId: q.questionId },
          },
          create: {
            attemptId: attempt.id,
            questionId: q.questionId,
            value: yours,
            isCorrect: correct,
          },
          update: { value: yours, isCorrect: correct },
        });
      }
      bandScore = rawToBand(rawScore ?? 0);
      await tx.ieltsAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          rawScore,
          totalQuestions,
          bandScore,
          elapsedSec,
        },
      });
    });
  } else {
    // رایتینگ — متن‌ها ذخیره می‌شوند؛ بند خودکار وجود ندارد
    await prisma.$transaction(async (tx) => {
      for (const qid of ["w1", "w2"]) {
        const text = savedAnswers[qid] ?? "";
        if (!text.trim()) continue;
        await tx.ieltsAnswer.upsert({
          where: {
            attemptId_questionId: { attemptId: attempt.id, questionId: qid },
          },
          create: { attemptId: attempt.id, questionId: qid, value: text },
          update: { value: text },
        });
      }
      await tx.ieltsAttempt.update({
        where: { id: attempt.id },
        data: { status: "SUBMITTED", submittedAt: new Date(), elapsedSec },
      });
    });
  }

  return ok({
    skill,
    status: "SUBMITTED",
    rawScore,
    totalQuestions,
    bandScore,
    elapsedSec,
  });
}
