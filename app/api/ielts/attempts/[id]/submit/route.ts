import { requireAuth, ok, err } from "@/lib/api-helpers";
import { parseTestSlug, getTestById } from "@/lib/ielts/real-tests";
import { getAnswerKey } from "@/lib/ielts/keys";
import { getPdfAnswerKey } from "@/lib/ielts/answer-keys";
import { getAiAnswerKey } from "@/lib/ielts/ai-paper";
import { isAnswerCorrect, rawToBand, countWords } from "@/lib/ielts/grade";
import { prisma } from "@/prisma/Prisma client";
// v1.0.5.0 (English 1.0.1.0): ولیدیشن zod بدنهٔ تحویل
import { attemptSubmitSchema, answersToMap } from "@/lib/validation";
// v1.0.6.9 — اعلان ثبت آزمون برای کاربر
import { notifyUser, faDigits } from "@/lib/notify";

/** نام فارسی مهارت برای متن اعلان */
function skillFa(skill: string): string {
  if (skill === "reading") return "ریدینگ";
  if (skill === "listening") return "لیسنینگ";
  return "رایتینگ";
}

/** نام انگلیسی مهارت (حرف اول بزرگ) برای متن اعلان */
function skillEn(skill: string): string {
  const s = skill === "reading" || skill === "listening" ? skill : "writing";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** بند آیلتس به رشتهٔ خوانا — 7 → "7" و 7.5 → "7.5" */
function formatBand(band: number): string {
  return String(band);
}

// ========================================
// POST /api/ielts/attempts/[id]/submit — تحویل (v1.0.3.6)
//  - ریدینگ/لیسنینگ — اولویت تصحیح خودکار:
//      ۱) کلید دستی lib/ielts/keys.ts
//      ۲) پاسخ‌نامهٔ خود PDF کتاب (بخش Answer key)
//      ۳) هیچ‌کدام → selfScoreRequired (خودتصحیحی)
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

  // v1.0.5.0 — ولیدیشن zod؛ بدنهٔ خالی/خراب مثل قبل «هیچی» حساب می‌شود
  let body: { elapsedSec?: number; answers?: Record<string, unknown> } = {};
  try {
    const raw: unknown = await req.json();
    const parsed = attemptSubmitSchema.safeParse(raw);
    if (parsed.success) body = parsed.data;
  } catch {
    /* بدنهٔ خالی مجاز است */
  }

  // پاسخ‌های نهایی ارسالی (اگر هست) با ذخیره‌های قبلی ادغام می‌شود
  const savedAnswers: Record<string, string> = {};
  for (const a of attempt.answers) savedAnswers[a.questionId] = a.value;
  if (body.answers && typeof body.answers === "object") {
    Object.assign(savedAnswers, answersToMap(body.answers));
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

    // v1.0.6.9 — اعلان ثبت رایتینگ (بعد از تراکنش، هرگز خطا نمی‌دهد)
    await notifyUser(auth.session.user.id, {
      type: "ielts",
      link: "/ielts",
      titleFa: "متن رایتینگ ثبت شد ✍️",
      titleEn: "Writing submitted ✍️",
      textFa:
        "متن تسک‌های رایتینگت ثبت شد. نمره را می‌توانی در صفحهٔ آزمون ببینی.",
      textEn:
        "Your writing tasks were recorded. You can view the result on the exam page.",
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

  // منبع کلید: ۱) دستی keys.ts → ۲) کلید استخراج‌شده با هوش مصنوعی
  // (IeltsAiPaper) → ۳) پاسخ‌نامهٔ خود PDF کتاب
  // (کلید باید برای «همین مهارت» مدخل داشته باشد — کلیدِ فقط-لیسنینگ
  // نباید ریدینگ را به مسیر تصحیح خودکارِ تهی ببرد)
  const keyPrefix = skill === "reading" ? "r" : "l";
  let key = getAnswerKey(attempt.testSlug);
  let keySource: "manual" | "ai" | "pdf" | null =
    key && Object.keys(key).some((k) => k.startsWith(keyPrefix)) ? "manual" : null;
  if (!keySource) {
    // v1.0.4.0 — کلید AI (همان آزمونی که برگه‌اش با AI ساخته شده)
    const aiKey = await getAiAnswerKey(parsed.bookNumber, parsed.testNumber, skill);
    if (aiKey && Object.keys(aiKey).some((k) => k.startsWith(keyPrefix))) {
      key = aiKey;
      keySource = "ai";
    }
  }
  if (!keySource) {
    const pdfKey = await getPdfAnswerKey(parsed.bookNumber, parsed.testNumber, skill);
    if (pdfKey) {
      key = pdfKey;
      keySource = "pdf";
    }
  }

  // ----- حالت ۱: کلید پاسخ موجود → تصحیح خودکار -----
  if (key && Object.keys(key).length > 0 && keySource) {
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

    // v1.0.6.9 — اعلان آزمون تصحیح‌شده (بعد از تراکنش، هرگز خطا نمی‌دهد)
    await notifyUser(auth.session.user.id, {
      type: "ielts",
      link: "/ielts",
      titleFa: `آزمون آیلتس ثبت شد — بند ${faDigits(formatBand(rawToBand(rawScore)))}`,
      titleEn: `IELTS exam submitted — band ${formatBand(rawToBand(rawScore))}`,
      textFa: `کتاب ${faDigits(parsed.bookNumber)} — تست ${faDigits(parsed.testNumber)} (${skillFa(skill)}): نمرهٔ خام ${faDigits(rawScore)} از ${faDigits(meta.questions)}.`,
      textEn: `Book ${parsed.bookNumber} — Test ${parsed.testNumber} (${skillEn(skill)}): raw score ${rawScore}/${meta.questions}.`,
    });

    return ok({
      skill,
      status: "SUBMITTED" as const,
      rawScore,
      totalQuestions: meta.questions,
      bandScore: rawToBand(rawScore),
      selfScoreRequired: false,
      keySource,
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

  // v1.0.6.9 — اعلان حالت خودتصحیحی (بعد از تراکنش، هرگز خطا نمی‌دهد)
  await notifyUser(auth.session.user.id, {
    type: "ielts",
    link: "/ielts",
    titleFa: "آزمون ثبت شد — منتظر ورود نمرهٔ خودت",
    titleEn: "Exam submitted — waiting for your score",
    textFa:
      "پاسخ‌نامهٔ رسمی برای این آزمون در دسترس نبود؛ نمرهٔ خام خودت را از پاسخ‌نامهٔ کتاب وارد کن.",
    textEn:
      "No official answer key was available; enter your raw score from the book's answer sheet.",
  });

  return ok({
    skill,
    status: "SUBMITTED" as const,
    rawScore: null,
    totalQuestions: meta.questions,
    bandScore: null,
    selfScoreRequired: true,
    keySource: null,
    elapsedSec,
  });
}
