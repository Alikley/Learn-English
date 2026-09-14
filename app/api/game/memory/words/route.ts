import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import { MEMORY_WORDS } from "@/data/memory/words";
import type { CefrLevel, GameLevel } from "@/types/game";

// ========================================
// GET /api/game/memory/words?count=12&level=EASY|MEDIUM|HARD
// دریافت جفت کلمات تصادفی (انگلیسی + معنی فارسی) برای بازی حافظه
//
// سطح‌بندی بر اساس CEFR است (آسان=A1 / متوسط=A2-B1 / سخت=B2-C1).
// اولویت با دیتابیس است؛ اگه برای سطح خواسته‌شده کافی نبود
// از لیست ثابت تکمیل می‌شود (همان الگوی مقاوم‌سازی هنگ‌من:
// لیست ثابت مرجع کانونی سطح هر کلمه است و ردیف‌های DB
// با سطح CEFR کانونی بازتقییم می‌شوند).
// ========================================

const VALID_LEVELS = new Set(["EASY", "MEDIUM", "HARD"]);

// نگاشت سطح‌های قدیمی → سطح استاندارد (برای کلمات ناشناخته در لیست)
const LEGACY_LEVEL_MAP: Record<string, GameLevel> = {
  BEGINNER: "EASY",
  ELEMENTARY: "MEDIUM",
  INTERMEDIATE: "HARD",
  ADVANCED: "HARD",
  UPPER_INTERMEDIATE: "HARD",
};

// نقشه کانونی: متن کلمه → (سطح CEFR، سطح بازی) از لیست ثابت
const CANONICAL: Map<string, { level: GameLevel; cefr: CefrLevel }> = new Map(
  MEMORY_WORDS.map((w) => [w.word.toLowerCase(), { level: w.level, cefr: w.cefr }]),
);

// CEFR تخمینی برای کلماتی که در لیست کانونی نیستند
const LEVEL_TO_CEFR: Record<GameLevel, CefrLevel> = {
  EASY: "A1",
  MEDIUM: "B1",
  HARD: "B2",
};

type PairRow = {
  id: number;
  word: string;
  translation: string;
  category: string;
  level: string;
  cefr?: CefrLevel;
};

// سطح هر ردیف را استاندارد می‌کند + بازتقییم CEFR کانونی
function normalizeLevel(
  raw: string,
  word: string,
): { level: GameLevel; cefr: CefrLevel } {
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

    // ---- تعداد جفت کلمات ----
    const countParam = Number(searchParams.get("count"));
    const count = Number.isFinite(countParam) && countParam > 0
      ? Math.min(Math.max(Math.trunc(countParam), 1), 30)
      : 9;

    // ---- سطح بازی (اختیاری) ----
    const levelParam = searchParams.get("level");
    if (levelParam && !VALID_LEVELS.has(levelParam)) {
      return err("سطح بازی نامعتبر است", 400);
    }
    const level = levelParam as GameLevel | null;

    // ---- ۱. دریافت همه جفت‌های فعال از دیتابیس ----
    // (فیلتر سطح در کد انجام می‌شود تا مقادیر قدیمی هم پوشش داده شوند)
    let dbPairs: PairRow[] = [];
    try {
      dbPairs = await prisma.memoryWord.findMany({
        where: { isActive: true },
        select: {
          id: true,
          word: true,
          translation: true,
          category: true,
          level: true,
        },
      });
    } catch {
      // اگه جدول هنوز ساخته نشده بود، از لیست ثابت استفاده می‌کنیم
    }

    // ---- ۲. بازتقییم CEFR کانونی + فیلتر سطح خواسته‌شده ----
    const dbPool: PairRow[] = dbPairs
      .map((w) => {
        const norm = normalizeLevel(w.level, w.word);
        return { ...w, level: norm.level, cefr: norm.cefr };
      })
      .filter((w) => !level || w.level === level);

    // ---- ۳. استخر کلمات: ادغام DB + لیست ثابت (v1.0.0.6) ----
    // ردیف‌های DB با کلمات تازه‌ی لیست ثابت ادغام می‌شوند تا
    // کلمات جدید حتی بدون اجرای دوباره seed هم در بازی بیایند.
    const pool: PairRow[] = dbPool.map((w) => ({
      ...w,
      word: w.word.toLowerCase(),
    }));

    const existing = new Set(pool.map((w) => w.word));
    for (const w of MEMORY_WORDS) {
      if (level && w.level !== level) continue;
      if (existing.has(w.word.toLowerCase())) continue;
      existing.add(w.word.toLowerCase());
      pool.push({
        id: -(pool.length + 1),
        word: w.word.toLowerCase(),
        translation: w.translation,
        category: w.category,
        level: w.level,
        cefr: w.cefr,
      });
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
    console.error("Memory words error:", e);
    return err("خطا در دریافت کلمات بازی حافظه", 500);
  }
}
