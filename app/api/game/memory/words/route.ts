import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import { MEMORY_WORDS } from "@/data/memory/words";
import type { GameLevel } from "@/types/game";

// ========================================
// GET /api/game/memory/words?count=9&level=EASY|MEDIUM|HARD
// دریافت جفت کلمات تصادفی (انگلیسی + معنی فارسی) برای بازی حافظه
//
// اولویت با دیتابیس است؛ اگه برای سطح خواسته‌شده کافی نبود
// از لیست ثابت تکمیل می‌شود (همان الگوی مقاوم‌سازی هنگ‌من).
// ========================================

const VALID_LEVELS = new Set(["EASY", "MEDIUM", "HARD"]);

// نگاشت سطح‌های احتمالی قدیمی/نامعتبر → سطح استاندارد
const LEGACY_LEVEL_MAP: Record<string, GameLevel> = {
  BEGINNER: "EASY",
  ELEMENTARY: "MEDIUM",
  INTERMEDIATE: "HARD",
  ADVANCED: "HARD",
  UPPER_INTERMEDIATE: "HARD",
};

type PairRow = {
  id: number;
  word: string;
  translation: string;
  category: string;
  level: string;
};

// سطح هر ردیف را به مقدار استاندارد تبدیل می‌کند
function normalizeLevel(raw: string): GameLevel {
  if (raw === "EASY" || raw === "MEDIUM" || raw === "HARD") return raw;
  return LEGACY_LEVEL_MAP[raw] ?? "EASY";
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

    // ---- ۲. نرمال‌سازی سطح‌ها + فیلتر سطح خواسته‌شده ----
    const dbPool: PairRow[] = dbPairs
      .map((w) => ({ ...w, level: normalizeLevel(w.level) }))
      .filter((w) => !level || w.level === level);

    // ---- ۳. استخر جفت‌ها (DB + تکمیل از لیست ثابت) ----
    const pool: PairRow[] = dbPool.map((w) => ({
      ...w,
      word: w.word.toLowerCase(),
    }));

    // اگه دیتابیس برای این سطح کافی نبود، از لیست ثابت اضافه می‌کنیم
    if (pool.length < count) {
      const existing = new Set(pool.map((w) => w.word));
      for (const w of MEMORY_WORDS) {
        if (pool.length >= count) break;
        if (level && w.level !== level) continue;
        if (existing.has(w.word.toLowerCase())) continue;
        existing.add(w.word.toLowerCase());
        pool.push({
          id: -(pool.length + 1),
          word: w.word.toLowerCase(),
          translation: w.translation,
          category: w.category,
          level: w.level,
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
    console.error("Memory words error:", e);
    return err("خطا در دریافت کلمات بازی حافظه", 500);
  }
}
