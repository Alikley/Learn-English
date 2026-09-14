import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import {
  SPEEDQUIZ_WORDS,
  SPEEDQUIZ_SENTENCES,
  getSpeedQuizWordsByLevel,
  getSpeedQuizSentencesByLevel,
} from "@/data/speedquiz/questions";
import type { CefrLevel, GameLevel, SpeedQuizQuestion } from "@/types/game";

// ========================================
// GET /api/game/speedquiz/questions?count=10&level=EASY|MEDIUM|HARD
// دریافت سوال‌های تصادفی کوییز سرعتی (کلمه + جمله)
//
// سطح‌بندی بر اساس CEFR است (آسان=A1 / متوسط=A2-B1 / سخت=B2-C1).
// اولویت با دیتابیس است؛ اگه برای سطح خواسته‌شده کافی نبود
// از لیست ثابت تکمیل می‌شود (همان الگوی مقاوم‌سازی هنگ‌من و حافظه:
// لیست ثابت مرجع کانونی سطح هر سوال است و ردیف‌های DB
// با سطح CEFR کانونی بازتقییم می‌شوند).
// گزینه‌های هر سوال سمت سرور شافل می‌شوند + correctIndex برمی‌گردد.
// ========================================

const VALID_LEVELS = new Set(["EASY", "MEDIUM", "HARD"]);

// نگاشت سطح‌های قدیمی → سطح استاندارد (برای سوال‌های ناشناخته در لیست)
const LEGACY_LEVEL_MAP: Record<string, GameLevel> = {
  BEGINNER: "EASY",
  ELEMENTARY: "MEDIUM",
  INTERMEDIATE: "HARD",
  ADVANCED: "HARD",
  UPPER_INTERMEDIATE: "HARD",
};

// نقشه کانونی: متن سوال → (سطح CEFR، سطح بازی) از لیست ثابت
function normKey(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

const CANONICAL: Map<string, { level: GameLevel; cefr: CefrLevel }> = new Map([
  ...SPEEDQUIZ_WORDS.map((w) => [
    normKey(w.word),
    { level: w.level, cefr: w.cefr },
  ] as const),
  ...SPEEDQUIZ_SENTENCES.map((s) => [
    normKey(s.sentence),
    { level: s.level, cefr: s.cefr },
  ] as const),
]);

// CEFR تخمینی برای سوال‌هایی که در لیست کانونی نیستند
const LEVEL_TO_CEFR: Record<GameLevel, CefrLevel> = {
  EASY: "A1",
  MEDIUM: "B1",
  HARD: "B2",
};

type QuestionRow = {
  id: number;
  type: string;
  prompt: string;
  answer: string;
  distractors: string;
  translation: string;
  category: string;
  level: string;
  cefr?: string;
};

// سطح هر ردیف را استاندارد می‌کند + بازتقییم CEFR کانونی
function normalizeLevel(
  raw: string,
  prompt: string,
): { level: GameLevel; cefr: CefrLevel } {
  // ۱) سوال شناخته‌شده؟ سطح کانونی CEFR معیار است
  const canon = CANONICAL.get(normKey(prompt));
  if (canon) return canon;
  // ۲) سوال ناشناخته — سطح DB را نرمال می‌کنیم
  if (raw === "EASY" || raw === "MEDIUM" || raw === "HARD") {
    return { level: raw, cefr: LEVEL_TO_CEFR[raw] };
  }
  const legacy = LEGACY_LEVEL_MAP[raw] ?? "EASY";
  return { level: legacy, cefr: LEVEL_TO_CEFR[legacy] };
}

// ---- شافل تصادفی (Fisher–Yates) ----
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- ساخت سوال نهایی: گزینه‌ها شافل + correctIndex ----
function buildQuestion(row: QuestionRow): SpeedQuizQuestion | null {
  let distractors: string[] = [];
  try {
    const parsed = JSON.parse(row.distractors);
    if (Array.isArray(parsed)) distractors = parsed.map(String);
  } catch {
    distractors = [];
  }

  // گزینه‌های نامعتبر → این سوال را حذف می‌کنیم
  if (distractors.length !== 3 || !row.answer) return null;

  const options = shuffle([row.answer, ...distractors]);
  const correctIndex = options.indexOf(row.answer);

  const type = row.type === "SENTENCE" ? "SENTENCE" : "WORD";

  return {
    id: row.id,
    type,
    prompt: row.prompt,
    options,
    correctIndex,
    translation: row.translation ?? "",
    category: row.category ?? "general",
    level: (row.level as GameLevel) ?? "EASY",
    cefr: row.cefr as CefrLevel | undefined,
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);

    // ---- تعداد سوال‌ها ----
    const countParam = Number(searchParams.get("count"));
    const count =
      Number.isFinite(countParam) && countParam > 0
        ? Math.min(Math.max(Math.trunc(countParam), 1), 30)
        : 10;

    // ---- سطح بازی (اختیاری) ----
    const levelParam = searchParams.get("level");
    if (levelParam && !VALID_LEVELS.has(levelParam)) {
      return err("سطح بازی نامعتبر است", 400);
    }
    const level = levelParam as GameLevel | null;

    // ---- ۱. دریافت همه سوال‌های فعال از دیتابیس ----
    // (فیلتر سطح در کد انجام می‌شود تا مقادیر قدیمی هم پوشش داده شوند)
    let dbRows: QuestionRow[] = [];
    try {
      dbRows = await prisma.speedQuizQuestion.findMany({
        where: { isActive: true },
        select: {
          id: true,
          type: true,
          prompt: true,
          answer: true,
          distractors: true,
          translation: true,
          category: true,
          level: true,
          cefr: true,
        },
      });
    } catch {
      // اگه جدول هنوز ساخته نشده بود، از لیست ثابت استفاده می‌کنیم
    }

    // ---- ۲. بازتقییم CEFR کانونی + فیلتر سطح خواسته‌شده ----
    const dbPool: QuestionRow[] = dbRows
      .map((r) => {
        const norm = normalizeLevel(r.level, r.prompt);
        return { ...r, level: norm.level, cefr: norm.cefr };
      })
      .filter((r) => !level || r.level === level);

    // ---- ۳. استخر سوال‌ها (DB + تکمیل از لیست ثابت) ----
    const pool: QuestionRow[] = [...dbPool];

    if (pool.length < count) {
      const existing = new Set(pool.map((r) => normKey(r.prompt)));
      if (level) {
        const staticWords = getSpeedQuizWordsByLevel(level);
        const staticSentences = getSpeedQuizSentencesByLevel(level);
        const staticPool = shuffle([...staticWords, ...staticSentences]);
        for (const item of staticPool) {
          if (pool.length >= count) break;
          const prompt = "word" in item ? item.word : item.sentence;
          if (existing.has(normKey(prompt))) continue;
          existing.add(normKey(prompt));
          pool.push(
            "word" in item
              ? {
                  id: -(pool.length + 1),
                  type: "WORD",
                  prompt: item.word,
                  answer: item.translation,
                  distractors: JSON.stringify(item.distractors),
                  translation: item.translation,
                  category: item.category,
                  level: item.level,
                  cefr: item.cefr,
                }
              : {
                  id: -(pool.length + 1),
                  type: "SENTENCE",
                  prompt: item.sentence,
                  answer: item.answer,
                  distractors: JSON.stringify(item.distractors),
                  translation: item.translation,
                  category: item.category,
                  level: item.level,
                  cefr: item.cefr,
                },
          );
        }
      }
    }

    // ---- ۴. شافل نهایی + ساخت سوال‌ها (گزینه‌ها هم شافل) ----
    shuffle(pool);
    const questions = pool
      .map(buildQuestion)
      .filter((q): q is SpeedQuizQuestion => q !== null)
      .slice(0, count);

    return ok({
      questions,
      source: dbPool.length >= count ? "db" : "mixed",
      level: level ?? "ALL",
      totalAvailable: pool.length,
    });
  } catch (e) {
    console.error("Speed quiz questions error:", e);
    return err("خطا در دریافت سوال‌های کوییز سرعتی", 500);
  }
}
