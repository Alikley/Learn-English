import { requireAuth, ok, err } from "@/lib/api-helpers";
import { parseTestSlug, getTestById } from "@/lib/ielts/real-tests";
import { buildAttemptPayload, examRemainingSec, skillMinutes } from "@/lib/ielts/attempt-payload";
import { countWords } from "@/lib/ielts/grade";
import { getAnswerKey } from "@/lib/ielts/keys";
import { prisma } from "@/prisma/prisma-client";
// v1.0.5.0 (English 1.0.1.0): ولیدیشن zod بدنهٔ ذخیرهٔ خودکار
import { validateJson, answersSaveSchema, sanitizeAnswers } from "@/lib/validation";

// ========================================
// /api/ielts/attempts/[id] (v1.0.3.3)
//  GET  — واکشی/ادامهٔ تلاش (پس از submit: نتیجه + ریویو در صورت وجود کلید)
//  PUT  — ذخیرهٔ خودکار پاسخ‌ها { answers: Record<questionId, value> }
// ========================================

async function loadAttempt(id: string, userId: string) {
  const attempt = await prisma.ieltsAttempt.findUnique({
    where: { id },
    include: { answers: true },
  });
  if (!attempt) return { error: err("تلاش یافت نشد", 404) };
  if (attempt.userId !== userId) return { error: err("دسترسی ندارید", 403) };
  return { attempt };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const { attempt, error } = await loadAttempt(id, auth.session.user.id);
  if (error || !attempt) return error!;

  const parsed = parseTestSlug(attempt.testSlug);
  if (!parsed) return err("آزمون یافت نشد", 404);
  const test = getTestById(parsed.bookNumber, parsed.testNumber);
  if (!test) return err("آزمون یافت نشد", 404);

  const savedAnswers: Record<string, string> = {};
  for (const a of attempt.answers) savedAnswers[a.questionId] = a.value;

  const skill = attempt.skill.toLowerCase() as "reading" | "listening" | "writing";
  const remainingSec = examRemainingSec(attempt, skillMinutes(skill, test));

  const payload = await buildAttemptPayload(attempt, savedAnswers, remainingSec);
  if (!payload) return err("آزمون یافت نشد", 404);

  // اگر submitted است، نتیجه هم همراه payload برگردانده می‌شود
  if (attempt.status === "SUBMITTED") {
    const base = {
      ...payload,
      rawScore: attempt.rawScore,
      totalQuestions: attempt.totalQuestions,
      bandScore: attempt.bandScore,
      selfScored: attempt.selfScored,
      elapsedSec: attempt.elapsedSec,
    };
    if (skill === "writing") {
      return ok({
        ...base,
        writingSubmissions: attempt.answers
          .filter((a) => a.questionId === "w1" || a.questionId === "w2")
          .map((a) => ({
            questionId: a.questionId,
            text: a.value,
            wordCount: countWords(a.value),
          })),
      });
    }
    // ریویو فقط وقتی معنی دارد که پاسخ‌ها علامت خورده باشند (کلید موجود)
    // correctAnswer از کلید رسمی پر می‌شود تا مرور بعد از تحویل کامل باشد
    const key = getAnswerKey(attempt.testSlug);
    const review = attempt.answers
      .filter((a) => a.isCorrect !== null)
      .map((a) => ({
        questionId: a.questionId,
        yourAnswer: a.value,
        correctAnswer: key?.[a.questionId]?.[0] ?? null,
        isCorrect: a.isCorrect === true,
      }));
    return ok({ ...base, review });
  }

  return ok(payload);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const { attempt, error } = await loadAttempt(id, auth.session.user.id);
  if (error || !attempt) return error!;
  if (attempt.status === "SUBMITTED") return err("این آزمون تحویل شده است");

  // v1.0.5.0 — ولیدیشن zod + پاک‌سازی مثل قبل (سقف ۸۰ مدخل/طول مقدار)
  const parsed = await validateJson(req, answersSaveSchema);
  if (!parsed.ok) return parsed.response;
  const entries = sanitizeAnswers(parsed.data.answers);

  // upsert سطر به سطر (حجم کم — حداکثر ۴۰ سوال/۲ تسک)
  for (const entry of entries) {
    await prisma.ieltsAnswer.upsert({
      where: {
        attemptId_questionId: { attemptId: attempt.id, questionId: entry.questionId },
      },
      create: { attemptId: attempt.id, ...entry },
      update: { value: entry.value },
    });
  }

  return ok({ saved: entries.length });
}
