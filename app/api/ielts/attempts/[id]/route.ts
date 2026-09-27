import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getTestBySlug, flatQuestions } from "@/lib/ielts/content";
import { isAnswerCorrect, countWords } from "@/lib/ielts/grade";
import { prisma } from "@/prisma/Prisma client";
import { buildPayload } from "../route";

// ========================================
// /api/ielts/attempts/[id] (v1.0.3.2)
//  GET  — واکشی/ادامهٔ تلاش (پس از submit: نتیجهٔ کامل با ریویو)
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

  const test = getTestBySlug(attempt.testSlug);
  if (!test) return err("آزمون یافت نشد", 404);

  const savedAnswers: Record<string, string> = {};
  for (const a of attempt.answers) savedAnswers[a.questionId] = a.value;

  let remainingSec: number | null = null;
  if (attempt.status === "IN_PROGRESS" && attempt.mode === "EXAM") {
    const skill = attempt.skill.toLowerCase();
    const minutes =
      skill === "reading" ? test.reading.minutes : skill === "listening" ? test.listening.minutes : test.writing.minutes;
    const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
    remainingSec = Math.max(0, minutes * 60 - elapsed);
  }

  // اگر submitted است، نتیجهٔ کامل با ریویو برگردانده می‌شود
  if (attempt.status === "SUBMITTED") {
    const skill = attempt.skill.toLowerCase();
    if (skill === "writing") {
      return ok({
        ...buildPayload(attempt, savedAnswers, 0),
        writingSubmissions: attempt.answers
          .filter((a) => a.questionId === "w1" || a.questionId === "w2")
          .map((a) => ({ questionId: a.questionId, text: a.value, wordCount: countWords(a.value) })),
      });
    }
    const review = flatQuestions(test, skill as "reading" | "listening").map((q) => {
      const yours = savedAnswers[q.questionId] ?? "";
      return {
        questionId: q.questionId,
        number: q.number,
        part: q.part,
        type: q.type,
        yourAnswer: yours,
        correctDisplay: q.answerDisplay,
        isCorrect: isAnswerCorrect(yours, q.accepted),
        explanation: q.explanation,
      };
    });
    return ok({
      ...buildPayload(attempt, savedAnswers, 0),
      review,
      rawScore: attempt.rawScore,
      totalQuestions: attempt.totalQuestions,
      bandScore: attempt.bandScore,
      elapsedSec: attempt.elapsedSec,
    });
  }

  return ok(buildPayload(attempt, savedAnswers, remainingSec));
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

  let body: { answers?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return err("درخواست نامعتبر است");
  }
  const answers = body.answers;
  if (!answers || typeof answers !== "object") return err("پاسخ‌ها ارسال نشده است");

  const entries = Object.entries(answers)
    .filter(([qid, v]) => typeof qid === "string" && qid.length <= 20 && typeof v === "string")
    .slice(0, 80)
    .map(([questionId, value]) => ({ questionId, value: value.slice(0, 20000) }));

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
