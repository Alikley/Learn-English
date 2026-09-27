import { requireAuth, ok, err } from "@/lib/api-helpers";
import { parseTestSlug, getTestById } from "@/lib/ielts/real-tests";
import { getAnswerKey } from "@/lib/ielts/keys";
import { isAnswerCorrect, rawToBand, countWords } from "@/lib/ielts/grade";
import { prisma } from "@/prisma/Prisma client";

// ========================================
// POST /api/ielts/attempts/[id]/submit — تحویل (v1.0.3.3)
//  - ریدینگ/لیسنینگ: اگر کلید پاسخ در lib/ielts/keys تعریف
//    شده باشد → تصحیح خودکار + بند + ریویو؛ وگرنه وضعیت
//    SUBMITTED با selfScoreRequired=true (خودتصحیحی از روی
//    پاسخ‌نامهٔ انتهای کتاب PDF)
//  - رایتینگ: ذخیرهٔ متن‌ها + شمارش کلمه
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

  const parsed = parseTestSlug(attempt.testSlug);
  if (!parsed) return err("آزمون یافت نشد", 404);
  const test = getTestById(parsed.bookNumber, parsed.testNumber);
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

  const skill = attempt.skill.toLowerCase() as "reading" | "listening" | "writing";
  const elapsedSec =
    typeof body.elapsedSec === "number" && body.elapsedSec >= 0
      ? Math.min(Math.floor(body.elapsedSec), 60 * 60 * 6)
      : Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

  // ---------------- رایتینگ ----------------
  if (skill === "writing") {
    const writingSubmissions: { questionId: string; text: string; wordCount: number }[] = [];
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
        writingSubmissions.push({ questionId: qid, text, wordCount: countWords(text) });
      }
      await tx.ieltsAttempt.update({
        where: { id: attempt.id },
        data: { status: "SUBMITTED", submittedAt: new Date(), elapsedSec },
      });
    });

    return ok({
      skill,
      status: "SUBMITTED" as const,
      rawScore: null,
      totalQuestions: null,
      bandScore: null,
      selfScoreRequired: false,
      elapsedSec,
      writingSubmissions,
    });
  }

  // ---------------- ریدینگ / لیسنینگ ----------------
  const meta = skill === "reading" ? test.reading : test.listening;
  const prefix = skill === "reading" ? "r" : "l";
  const questionIds = Array.from({ length: meta.questions }, (_, i) => `${prefix}${i + 1}`);
  const key = getAnswerKey(attempt.testSlug);

  // ----- حالت ۱: کلید پاسخ موجود → تصحیح خودکار -----
  if (key && Object.keys(key).length > 0) {
    let rawScore = 0;
    const review: {
      questionId: string;
      number: number;
      yourAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[] = [];

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < questionIds.length; i++) {
        const questionId = questionIds[i];
        const yours = savedAnswers[questionId] ?? "";
        const accepted = key[questionId] ?? [];
        const correct = accepted.length > 0 && isAnswerCorrect(yours, accepted);
        if (correct) rawScore++;
        await tx.ieltsAnswer.upsert({
          where: {
            attemptId_questionId: { attemptId: attempt.id, questionId },
          },
          create: {
            attemptId: attempt.id,
            questionId,
            value: yours,
            isCorrect: correct,
          },
          update: { value: yours, isCorrect: correct },
        });
        review.push({
          questionId,
          number: i + 1,
          yourAnswer: yours,
          correctAnswer: accepted[0] ?? "",
          isCorrect: correct,
        });
      }
      const bandScore = rawToBand(rawScore);
      await tx.ieltsAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          rawScore,
          totalQuestions: meta.questions,
          bandScore,
          elapsedSec,
          selfScored: false,
        },
      });
    });

    return ok({
      skill,
      status: "SUBMITTED" as const,
      rawScore,
      totalQuestions: meta.questions,
      bandScore: rawToBand(rawScore),
      selfScoreRequired: false,
      elapsedSec,
      review,
    });
  }

  // ----- حالت ۲: کلید نیست → خودتصحیحی از روی پاسخ‌نامهٔ کتاب -----
  // مقادیر نهایی پاسخ‌برگ ذخیره می‌شوند (بدون علامت درستی)
  await prisma.$transaction(async (tx) => {
    for (const questionId of questionIds) {
      const yours = savedAnswers[questionId] ?? "";
      await tx.ieltsAnswer.upsert({
        where: {
          attemptId_questionId: { attemptId: attempt.id, questionId },
        },
        create: { attemptId: attempt.id, questionId, value: yours },
        update: { value: yours },
      });
    }
    await tx.ieltsAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        totalQuestions: meta.questions,
        elapsedSec,
      },
    });
  });

  return ok({
    skill,
    status: "SUBMITTED" as const,
    rawScore: null,
    totalQuestions: meta.questions,
    bandScore: null,
    selfScoreRequired: true,
    elapsedSec,
  });
}
