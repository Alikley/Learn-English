import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import { updateStreak, getStreak } from "@/lib/streak";

const GAME_KEY = "memory";

// ========================================
// GET /api/game/memory/result
// آمار بازی حافظه کاربر + استریک — فقط برای نمایش در صفحه بازی‌ها
// ========================================
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const [stats, streak] = await Promise.all([
      prisma.gameScore.findUnique({
        where: { userId_game: { userId, game: GAME_KEY } },
      }),
      getStreak(userId),
    ]);

    return ok({
      stats: stats
        ? {
            bestScore: stats.bestScore,
            totalWins: stats.totalWins,
            totalLosses: stats.totalLosses,
            sessionsPlayed: stats.sessionsPlayed,
          }
        : { bestScore: 0, totalWins: 0, totalLosses: 0, sessionsPlayed: 0 },
      streak,
    });
  } catch (e) {
    console.error("Memory stats error:", e);
    return err("خطا در دریافت آمار بازی حافظه", 500);
  }
}

// ========================================
// POST /api/game/memory/result
//
// body: { action: "match" }
//   → ثبت یک جفت درست + آپدیت استریک یادگیری
//     (شاید کاربر روزش رو با بازی شروع کنه!)
//
// body: { action: "session", score: number, mistakes: number }
//   → پایان یک دور کامل + ثبت بهترین امتیاز و اشتباهات
// ========================================
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const body = await req.json();
    const action = body?.action;

    // ---- ثبت یک جفت درست + آپدیت استریک ----
    if (action === "match") {
      const existing = await prisma.gameScore.findUnique({
        where: { userId_game: { userId, game: GAME_KEY } },
      });

      if (existing) {
        await prisma.gameScore.update({
          where: { id: existing.id },
          data: {
            totalWins: existing.totalWins + 1,
            lastPlayedAt: new Date(),
          },
        });
      } else {
        await prisma.gameScore.create({
          data: {
            userId,
            game: GAME_KEY,
            totalWins: 1,
          },
        });
      }

      // ✅ اتصال بازی به روزهای متوالی یادگیری (گام ۷)
      const streak = await updateStreak(userId);

      return ok({
        streak: { current: streak.current, longest: streak.longest },
      });
    }

    // ---- پایان دور و ثبت بهترین امتیاز ----
    if (action === "session") {
      const score = Number(body?.score);
      const mistakesParam = Number(body?.mistakes);
      const mistakes =
        Number.isFinite(mistakesParam) && mistakesParam > 0
          ? Math.min(Math.trunc(mistakesParam), 999)
          : 0;

      if (!Number.isFinite(score) || score < 0) {
        return err("امتیاز نامعتبر است", 400);
      }

      const existing = await prisma.gameScore.findUnique({
        where: { userId_game: { userId, game: GAME_KEY } },
      });

      let stats;
      let isNewRecord = false;

      if (existing) {
        isNewRecord = score > existing.bestScore;
        stats = await prisma.gameScore.update({
          where: { id: existing.id },
          data: {
            bestScore: Math.max(existing.bestScore, score),
            totalLosses: existing.totalLosses + mistakes,
            sessionsPlayed: existing.sessionsPlayed + 1,
            lastPlayedAt: new Date(),
          },
        });
      } else {
        stats = await prisma.gameScore.create({
          data: {
            userId,
            game: GAME_KEY,
            bestScore: score,
            totalLosses: mistakes,
            sessionsPlayed: 1,
          },
        });
        isNewRecord = score > 0;
      }

      return ok({
        stats: {
          bestScore: stats.bestScore,
          totalWins: stats.totalWins,
          totalLosses: stats.totalLosses,
          sessionsPlayed: stats.sessionsPlayed,
        },
        isNewRecord,
      });
    }

    return err("action نامعتبر است", 400);
  } catch (e) {
    console.error("Memory result error:", e);
    return err("خطا در ثبت نتیجه بازی حافظه", 500);
  }
}
