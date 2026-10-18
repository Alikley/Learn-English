import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { NextRequest } from "next/server";
// v1.0.7.1 (English 1.0.1.14) — پارس query با zod به‌جای دستی
import { validateQuery, leaderboardGameSchema } from "@/lib/validation";

// ========================================
// GET /api/game/leaderboard?game=hangman|memory|speedquiz
// برترین امتیازها بین همه کاربران (نسخه ۱.۰.۲.۲ — گام ۲)
// - ۵ نفر اول بر اساس بهترین امتیاز هر بازی
// - رتبه کاربر فعلی هم برمی‌گردد (اگر رکوردی ثبت کرده باشد)
// - برای آماده کردن سایت به حالت چندکاربره آنلاین
// ========================================

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const qp = validateQuery(req, leaderboardGameSchema);
  if (!qp.ok) return qp.response;
  const game = qp.data.game;

  try {
    // ۵ رکورددار برتر
    const top = await prisma.gameScore.findMany({
      where: { game, bestScore: { gt: 0 } },
      orderBy: [{ bestScore: "desc" }, { updatedAt: "asc" }],
      take: 5,
      include: {
        user: {
          select: { name: true, nickname: true },
        },
      },
    });

    const leaders = top.map((row, i) => ({
      rank: i + 1,
      userId: row.userId,
      name:
        row.user?.name?.trim() ||
        row.user?.nickname?.trim() ||
        "بازیکن ناشناس",
      bestScore: row.bestScore,
      sessionsPlayed: row.sessionsPlayed,
      isYou: row.userId === userId,
    }));

    // رتبه کاربر فعلی
    const mine = await prisma.gameScore.findUnique({
      where: { userId_game: { userId, game } },
    });

    let you: { rank: number; bestScore: number } | null = null;
    if (mine && mine.bestScore > 0) {
      const ahead = await prisma.gameScore.count({
        where: { game, bestScore: { gt: mine.bestScore } },
      });
      you = { rank: ahead + 1, bestScore: mine.bestScore };
    }

    return ok({ game, leaders, you });
  } catch (e) {
    console.error("Leaderboard error:", e);
    return err("خطا در دریافت برترین امتیازها", 500);
  }
}
