import { requireAuth, ok, err } from "@/lib/api-helpers";
import { parseTestSlug, getTestById } from "@/lib/ielts/real-tests";
import { buildAttemptPayload, examRemainingSec, skillMinutes } from "@/lib/ielts/attempt-payload";
import { countWords } from "@/lib/ielts/grade";
import { prisma } from "@/prisma/Prisma client";

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
    const review = attempt.answers
      .filter((a) => a.isCorrect !== null)
      .map((a) => ({
        questionId: a.questionId,
        yourAnswer: a.value,
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
