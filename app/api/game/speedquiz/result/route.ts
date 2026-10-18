import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { NextRequest } from "next/server";
import { updateStreak, getStreak } from "@/lib/streak";
import { reportError } from "@/lib/report-error";
import { notifyUser, faDigits } from "@/lib/notify";
// v1.0.7.1 (English 1.0.1.14) — پارس بدنه با zod به‌جای دستی
import {
  readJsonBody,
  validateObject,
  gameActionSchema,
  speedquizSessionSchema,
} from "@/lib/validation";

const GAME_KEY = "speedquiz";
// v1.0.6.9 — نام بازی برای اعلان رکورد جدید
const GAME_FA = "کوییز سرعتی";
const GAME_EN = "Speed Quiz";

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
    reportError(e, { route: "/api/game/speedquiz/result", userId });
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
    // بدنهٔ خام را نگه می‌داریم: z.object مرحلهٔ اول کلیدهای دیگر را
    // strip می‌کند و اسکیمای هر action باید کلیدهای خودش را ببیند
    const raw = await readJsonBody(req);
    if (!raw.ok) return raw.response;
    const base = validateObject(gameActionSchema, raw.data);
    if (!base.ok) return base.response;
    const body: { action: string } = base.data;

    // ---- شروع دور جدید: دفعات بازی +۱ (گام ۱) ----
    if (body.action === "start") {
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
    if (body.action === "answer") {
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
    if (body.action === "session") {
      const s = validateObject(speedquizSessionSchema, raw.data);
      if (!s.ok) return s.response;
      const score = s.data.score;
      const wrong = s.data.wrong;

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
            // v1.0.0.7 — دفعات بازی فقط با action="start" ثبت می‌شود (رفع شمارش دوباره)
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

      // v1.0.6.9 — اعلان رکورد جدید (هرگز خطا نمی‌دهد)
      if (isNewRecord && score > 0) {
        await notifyUser(userId, {
          type: "game",
          link: "/game",
          titleFa: `🏆 رکورد جدید در ${GAME_FA} (${faDigits(score)} امتیاز)`,
          titleEn: `🏆 New record in ${GAME_EN} (${score} pts)`,
          textFa:
            "بهترین امتیازت در این بازی بالاتر رفت. از خودت جلو زدی — یک دور دیگر امتحان کن!",
          textEn:
            "Your best score just went up. You beat yourself — try another round!",
        });
      }

      return ok({
        stats: statsPayload(stats),
        isNewRecord,
      });
    }

    return err("action نامعتبر است", 400);
  } catch (e) {
    reportError(e, { route: "/api/game/speedquiz/result", userId });
    return err("خطا در ثبت نتیجه بازی کوییز سرعتی", 500);
  }
}
