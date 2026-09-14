import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import { HANGMAN_WORDS } from "@/data/hangman/words";
import type { CefrLevel, GameLevel } from "@/types/game";

// ========================================
// GET /api/game/hangman/words?count=10&level=EASY|MEDIUM|HARD
// دریافت کلمات تصادفی برای بازی هنگ‌من (با سطح انتخابی)
//
// سطح‌بندی بر اساس CEFR است (آسان=A1 / متوسط=A2-B1 / سخت=B2-C1).
// اولویت با دیتابیس است؛ اگه برای سطح خواسته‌شده کافی نبود
// از لیست ثابت تکمیل می‌شود.
// نکته مقاوم‌سازی: لیست ثابت مرجع کانونی سطح هر کلمه است؛
// هر ردیف DB که در لیست باشد با سطح CEFR کانونی بازتقییم می‌شود
// تا بازی روی هر وضعیت DB (سطح‌بندی قدیمی/قدیمی‌تر) درست کار کند.
// ========================================

const VALID_LEVELS = new Set(["EASY", "MEDIUM", "HARD"]);

// نگاشت سطح‌های قدیمی → سطح‌های سه‌گانه (برای کلمات ناشناخته در لیست)
const LEGACY_LEVEL_MAP: Record<string, GameLevel> = {
  BEGINNER: "EASY",
  ELEMENTARY: "MEDIUM",
  INTERMEDIATE: "HARD",
  ADVANCED: "HARD",
  UPPER_INTERMEDIATE: "HARD",
};

// نقشه کانونی: متن کلمه → (سطح CEFR، سطح بازی) از لیست ثابت
const CANONICAL: Map<string, { level: GameLevel; cefr: CefrLevel }> = new Map(
  HANGMAN_WORDS.map((w) => [w.word.toLowerCase(), { level: w.level, cefr: w.cefr }]),
);

// CEFR تخمینی برای کلماتی که در لیست کانونی نیستند
const LEVEL_TO_CEFR: Record<GameLevel, CefrLevel> = {
  EASY: "A1",
  MEDIUM: "B1",
  HARD: "B2",
};

type WordRow = {
  id: number;
  word: string;
  hint: string;
  category: string;
  level: string;
  cefr?: CefrLevel;
};

// سطح هر ردیف را به مقدار استاندارد تبدیل می‌کند + بازتقییت CEFR کانونی
function normalizeLevel(raw: string, word: string): { level: GameLevel; cefr: CefrLevel } {
  // ۱) کلمه شناخته‌شده؟ سطح کانونی CEFR معیار است
  const canon = CANONICAL.get(word.toLowerCase());
  if (canon) return canon;
  // ۲) کلمه ناشناخته — سطح DB را نرمال می‌کنیم
  if (raw === "EASY" || raw === "MEDIUM" || raw === "HARD") {
    return { level: raw, cefr: LEVEL_TO_CEFR[raw] };
  }
  const legacy = LEGACY_LEVEL_MAP[raw] ?? "EASY";
  return { level: legacy, cefr: LEVEL_TO_CEFR[legacy] };
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);

    // ---- تعداد کلمات ----
    const countParam = Number(searchParams.get("count"));
    const count = Number.isFinite(countParam) && countParam > 0
      ? Math.min(Math.max(Math.trunc(countParam), 1), 30)
      : 10;

    // ---- سطح بازی (اختیاری) ----
    const levelParam = searchParams.get("level");
    if (levelParam && !VALID_LEVELS.has(levelParam)) {
      return err("سطح بازی نامعتبر است", 400);
    }
    const level = levelParam as GameLevel | null;

    // ---- ۱. دریافت همه کلمات فعال از دیتابیس ----
    // (فیلتر سطح در کد انجام می‌شود تا سطح‌های قدیمی هم پوشش داده شوند)
    let dbWords: WordRow[] = [];
    try {
      dbWords = await prisma.gameWord.findMany({
        where: { isActive: true },
        select: {
          id: true,
          word: true,
          hint: true,
          category: true,
          level: true,
        },
      });
    } catch {
      // اگه جدول هنوز ساخته نشده بود، از لیست ثابت استفاده می‌کنیم
    }

    // ---- ۲. بازتقییت CEFR کانونی + فیلتر سطح خواسته‌شده ----
    const dbPool: WordRow[] = dbWords
      .map((w) => {
        const norm = normalizeLevel(w.level, w.word);
        return { ...w, level: norm.level, cefr: norm.cefr };
      })
      .filter((w) => !level || w.level === level);

    // ---- ۳. استخر کلمات (DB + تکمیل از لیست ثابت) ----
    const pool: WordRow[] = dbPool.map((w) => ({
      ...w,
      word: w.word.toLowerCase(),
    }));

    // اگه دیتابیس برای این سطح کافی نبود، از لیست ثابت کلماتِ جدید اضافه می‌کنیم
    if (pool.length < count) {
      const existing = new Set(pool.map((w) => w.word));
      for (const w of HANGMAN_WORDS) {
        if (pool.length >= count) break;
        if (level && w.level !== level) continue;
        if (existing.has(w.word.toLowerCase())) continue;
        existing.add(w.word.toLowerCase());
        pool.push({
          id: -(pool.length + 1),
          word: w.word.toLowerCase(),
          hint: w.hint,
          category: w.category,
          level: w.level,
          cefr: w.cefr,
        });
      }
    }

    // ---- ۴. شافل تصادفی (Fisher–Yates) ----
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return ok({
      words: pool.slice(0, count),
      source: dbPool.length >= count ? "db" : "mixed",
      level: level ?? "ALL",
      totalAvailable: pool.length,
    });
  } catch (e) {
    console.error("Hangman words error:", e);
    return err("خطا در دریافت کلمات بازی", 500);
  }
}
