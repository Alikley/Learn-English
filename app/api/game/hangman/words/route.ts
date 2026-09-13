import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import { HANGMAN_WORDS } from "@/data/hangman/words";

// ========================================
// GET /api/game/hangman/words?count=10
// دریافت کلمات تصادفی برای بازی هنگ‌من
// اولویت با دیتابیس است؛ اگه خالی بود fallback روی لیست ثابت
// ========================================
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const countParam = Number(searchParams.get("count"));
    const count = Number.isFinite(countParam) && countParam > 0
      ? Math.min(Math.max(Math.trunc(countParam), 1), 30)
      : 10;

    // ---- ۱. دریافت از دیتابیس ----
    let dbWords: { id: number; word: string; hint: string; category: string; level: string }[] = [];
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
    } catch (e) {
      // اگه جدول هنوز ساخته نشده بود، از لیست ثابت استفاده می‌کنیم
      console.warn("GameWord table not available, using static list:", e);
    }

    // ---- ۲. ساخت استخر کلمات (DB یا ثابت) ----
    const pool: { id: number; word: string; hint: string; category: string; level: string }[] =
      dbWords.length > 0
        ? dbWords.map((w) => ({ ...w, word: w.word.toLowerCase() }))
        : HANGMAN_WORDS.map((w, i) => ({
            id: -(i + 1),
            word: w.word.toLowerCase(),
            hint: w.hint,
            category: w.category,
            level: w.level,
          }));

    // ---- ۳. شافل تصادفی (Fisher–Yates) ----
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return ok({
      words: pool.slice(0, count),
      source: dbWords.length > 0 ? "db" : "static",
      totalAvailable: pool.length,
    });
  } catch (e) {
    console.error("Hangman words error:", e);
    return err("خطا در دریافت کلمات بازی", 500);
  }
}
