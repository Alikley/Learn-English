import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import { updateStreak, getStreak } from "@/lib/streak";

const GAME_KEY = "speedquiz";

// ========================================
// GET /api/game/speedquiz/result
// آمار بازی کوییز سرعتی کاربر + استریک — فقط برای نمایش در صفحه بازی‌ها
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
    console.error("Speed quiz stats error:", e);
    return err("خطا در دریافت آمار بازی کوییز سرعتی", 500);
  }
}

// ========================================
// POST /api/game/speedquiz/result
//
// body: { action: "start" }
//   → شروع یک دور جدید: ثبت دفعات بازی + lastPlayedAt (v1.0.0.6 — گام ۱)
//
// body: { action: "answer" }
//   → ثبت یک پاسخ درست + آپدیت استریک یادگیری
//     (شاید کاربر روزش رو با بازی شروع کنه!)
//     پاسخ شامل آمار به‌روز است تا کارت‌ها زنده تغییر کنند
//
// body: { action: "session", score: number, wrong: number }
//   → پایان یک دور کامل + ثبت بهترین امتیاز و پاسخ‌های غلط
// ========================================
function statsPayload(stats: {
  bestScore: number;
  totalWins: number;
  totalLosses: number;
  sessionsPlayed: number;
}) {
  return {
    bestScore: stats.bestScore,
    totalWins: stats.totalWins,
    totalLosses: stats.totalLosses,
    sessionsPlayed: stats.sessionsPlayed,
  };
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const body = await req.json();
    const action = body?.action;

    // ---- شروع دور جدید: دفعات بازی +۱ (گام ۱) ----
    if (action === "start") {
      const existing = await prisma.gameScore.findUnique({
        where: { userId_game: { userId, game: GAME_KEY } },
      });

      const stats = existing
        ? await prisma.gameScore.update({
            where: { id: existing.id },
            data: {
              sessionsPlayed: existing.sessionsPlayed + 1,
              lastPlayedAt: new Date(),
            },
          })
        : await prisma.gameScore.create({
            data: { userId, game: GAME_KEY, sessionsPlayed: 1 },
          });

      return ok({ stats: statsPayload(stats) });
    }

    // ---- ثبت یک پاسخ درست + آپدیت استریک ----
    if (action === "answer") {
      const existing = await prisma.gameScore.findUnique({
        where: { userId_game: { userId, game: GAME_KEY } },
      });

      // آمار به‌روز به کارت‌ها برمی‌گردد تا زنده تغییر کنند (گام ۱)
      const stats = existing
        ? await prisma.gameScore.update({
            where: { id: existing.id },
            data: {
              totalWins: existing.totalWins + 1,
              lastPlayedAt: new Date(),
            },
          })
        : await prisma.gameScore.create({
            data: {
              userId,
              game: GAME_KEY,
              totalWins: 1,
            },
          });

      // ✅ اتصال بازی به روزهای متوالی یادگیری (گام ۷)
      const streak = await updateStreak(userId);

      return ok({
        stats: statsPayload(stats),
        streak: { current: streak.current, longest: streak.longest },
      });
    }

    // ---- پایان دور و ثبت بهترین امتیاز ----
    if (action === "session") {
      const score = Number(body?.score);
      const wrongParam = Number(body?.wrong);
      const wrong =
        Number.isFinite(wrongParam) && wrongParam > 0
          ? Math.min(Math.trunc(wrongParam), 999)
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
            totalLosses: existing.totalLosses + wrong,
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
            totalLosses: wrong,
            sessionsPlayed: 1,
          },
        });
        isNewRecord = score > 0;
      }

      return ok({
        stats: statsPayload(stats),
        isNewRecord,
      });
    }

    return err("action نامعتبر است", 400);
  } catch (e) {
    console.error("Speed quiz result error:", e);
    return err("خطا در ثبت نتیجه بازی کوییز سرعتی", 500);
  }
}
