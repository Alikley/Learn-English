import { requireAuth, ok, err } from "@/lib/api-helpers";
import { ensureUserRow } from "@/lib/ensure-user";
import { getTestBySlug } from "@/lib/ielts/content";
import { prisma } from "@/prisma/Prisma client";
import type {
  IeltsAttemptPayload,
  IeltsClientGroup,
  IeltsQuestionGroup,
  IeltsQuestion,
  IeltsSkill,
  IeltsMode,
} from "@/types/ielts";

// ========================================
// POST /api/ielts/attempts — شروع یا ادامهٔ تلاش (v1.0.3.2)
// بدنه: { slug, skill, mode }
//  - اگر تلاش ناتمام همان آزمون+مهارت وجود داشته باشد، ادامه داده می‌شود
//  - payload بر اساس حالت: در تمرین پاسخ‌ها و تحلیل همراه است،
//    در آزمون فقط سوال‌ها (تصحیح در submit)
// ========================================

const SKILLS = ["reading", "listening", "writing"] as const;
const MODES = ["practice", "exam"] as const;

function stripQuestion(q: IeltsQuestion, withAnswers: boolean) {
  const base = {
    id: q.id,
    number: q.number,
    text: q.text,
    before: q.before,
    after: q.after,
    options: q.options,
  };
  if (!withAnswers) return base;
  return { ...base, answer: q.answer, answerDisplay: q.answerDisplay, explanation: q.explanation };
}

function stripGroup(g: IeltsQuestionGroup, withAnswers: boolean): IeltsClientGroup {
  return {
    id: g.id,
    part: g.part,
    type: g.type,
    heading: g.heading,
    instruction: g.instruction,
    wordLimit: g.wordLimit,
    options: g.options,
    lines: g.lines,
    table: g.table,
    questions: g.questions.map((q) => stripQuestion(q, withAnswers)),
  };
}

/** ساخت payload کامل یک تلاش (محتوا + پاسخ‌های ذخیره‌شده) */
export function buildPayload(
  attempt: {
    id: string;
    testSlug: string;
    skill: string;
    mode: string;
    status: string;
    startedAt: Date;
  },
  savedAnswers: Record<string, string>,
  remainingSec: number | null,
): IeltsAttemptPayload {
  const test = getTestBySlug(attempt.testSlug)!;
  const skill = attempt.skill.toLowerCase() as IeltsSkill;
  const mode = attempt.mode.toLowerCase() as IeltsMode;
  const withAnswers = mode === "practice" || attempt.status === "SUBMITTED";

  const payload: IeltsAttemptPayload = {
    attemptId: attempt.id,
    slug: attempt.testSlug,
    skill,
    mode,
    status: attempt.status as IeltsAttemptPayload["status"],
    remainingSec,
    savedAnswers,
  };

  if (skill === "reading") {
    payload.reading = {
      passages: test.reading.passages,
      groups: test.reading.groups.map((g) => stripGroup(g, withAnswers)),
      minutes: test.reading.minutes,
    };
  } else if (skill === "listening") {
    payload.listening = {
      sections: test.listening.sections.map((s) => ({
        ...s,
        // متن اسکریپت برای پخش مرورگر لازم است؛ در حالت آزمون پلیر
        // آن را نمایش نمی‌دهد (فقط می‌خواند)
        script: s.script,
      })),
      groups: test.listening.groups.map((g) => stripGroup(g, withAnswers)),
      minutes: test.listening.minutes,
    };
  } else {
    payload.writing = { tasks: test.writing.tasks, minutes: test.writing.minutes };
  }
  return payload;
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  let body: { slug?: string; skill?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return err("درخواست نامعتبر است");
  }

  const slug = String(body.slug ?? "");
  const skill = String(body.skill ?? "") as IeltsSkill;
  const mode = String(body.mode ?? "") as IeltsMode;

  if (!slug) return err("slug الزامی است");
  if (!SKILLS.includes(skill)) return err("مهارت نامعتبر است");
  if (!MODES.includes(mode)) return err("حالت نامعتبر است");

  const test = getTestBySlug(slug);
  if (!test) return err("آزمون یافت نشد", 404);
  if (!test.available) return err("این آزمون فعلاً در دسترس نیست");

  await ensureUserRow(auth.session);

  // ادامهٔ تلاش ناتمام همان آزمون+مهارت (حالت مهم نیست — از قبل شروع‌شده ادامه می‌یابد)
  const existing = await prisma.ieltsAttempt.findFirst({
    where: {
      userId: auth.session.user.id,
      testSlug: slug,
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
        testSlug: slug,
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

  // زمان باقی‌مانده در حالت آزمون: از شروع تلاش منهای سپری‌شده
  let remainingSec: number | null = null;
  if (attempt.mode.toUpperCase() === "EXAM") {
    const minutes =
      skill === "reading" ? test.reading.minutes : skill === "listening" ? test.listening.minutes : test.writing.minutes;
    const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
    remainingSec = Math.max(0, minutes * 60 - elapsed);
  }

  const payload = buildPayload(attempt, savedAnswers, remainingSec);
  return ok(payload);
}
