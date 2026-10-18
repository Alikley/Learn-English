import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { NextRequest } from "next/server";
import { updateStreak } from "@/lib/streak";
import { reportError } from "@/lib/report-error";
import { notifyUser, faDigits } from "@/lib/notify";
// v1.0.7.1 (English 1.0.1.14) — پارس بدنه با zod به‌جای دستی
import { validateJson, listeningAnswersSchema } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const { id } = await params;

    const episode = await prisma.listeningEpisode.findUnique({
      where: { id },
      include: {
        progress: {
          where: { userId },
          select: {
            stars: true,
            score: true,
            xpEarned: true,
            completedAt: true,
          },
        },
      },
    });

    if (!episode) return err("قسمت یافت نشد", 404);

    return ok({
      id: episode.id,
      title: episode.title,
      titleFa: episode.titleFa,
      description: episode.description,
      audioUrl: episode.audioUrl,
      level: episode.level,
      duration: episode.duration,
      xp: episode.xp,
      transcript: episode.transcript,
      gaps: episode.gaps,
      progress: episode.progress[0]
        ? {
            stars: episode.progress[0].stars,
            score: episode.progress[0].score,
            xpEarned: episode.progress[0].xpEarned,
            completedAt: episode.progress[0].completedAt?.toISOString() ?? null,
          }
        : null,
    });
  } catch {
    return err("خطا در دریافت تمرین", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const { id } = await params;
    const parsed = await validateJson(req, listeningAnswersSchema);
    if (!parsed.ok) return parsed.response;
    const answers = parsed.data.answers;

    const episode = await prisma.listeningEpisode.findUnique({
      where: { id },
      // v1.0.6.9 — title/titleFa/titleEn برای اعلان تمام‌شدن اولین بار
      select: { gaps: true, xp: true, title: true, titleEn: true, titleFa: true },
    });

    if (!episode) return err("قسمت یافت نشد", 404);

    const gaps = episode.gaps as { id: number; answer: string }[];
    const total = gaps.length;
    let correct = 0;

    gaps.forEach((gap) => {
      const userAnswer = (answers[gap.id] || "").trim().toLowerCase();
      const correctAnswer = gap.answer.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });

    // ستاره: ۸۰٪→۳ ستاره، ۵۰٪→۲ ستاره، >۰→۱ ستاره
    const percent = Math.round((correct / total) * 100);
    let stars = 0;
    if (percent >= 80) stars = 3;
    else if (percent >= 50) stars = 2;
    else if (percent > 0) stars = 1;

    // XP: بر اساس ستاره
    const xpEarned = Math.round((episode.xp * stars) / 3);

    // آپدیت یا ساخت progress — بهترین نتیجه حفظ میشه
    const existing = await prisma.listeningProgress.findUnique({
      where: { userId_episodeId: { userId, episodeId: id } },
    });

    // v1.0.6.9 — اعلان فقط برای اولین تمام‌شدن: ردیف نبود یا completedAt تنها طعناً نشده بود
    const wasFirst = !existing || existing.completedAt == null;

    if (existing && existing.stars >= stars) {
      // نتیجه قبلی بهتر بوده
      return ok({
        correct,
        total,
        stars: existing.stars,
        xpEarned: existing.xpEarned,
        percent,
        bestResult: true,
      });
    }

    await prisma.listeningProgress.upsert({
      where: { userId_episodeId: { userId, episodeId: id } },
      update: {
        stars,
        score: percent,
        xpEarned,
        completedAt: new Date(),
      },
      create: {
        userId,
        episodeId: id,
        stars,
        score: percent,
        xpEarned,
        completedAt: new Date(),
      },
    });

    // ✅ آپدیت streak
    await updateStreak(userId);

    // v1.0.6.9 — اعلان تمام اولین بار (هرگز خطا نمی‌دهد)
    if (wasFirst) {
      const title = episode.titleFa ?? episode.title;
      const titleEn = episode.titleEn ?? episode.title;
      await notifyUser(userId, {
        type: "listening",
        link: "/listening",
        titleFa: `🎧 «${title}» تمام شد`,
        titleEn: `🎧 "${titleEn}" completed`,
        textFa: `اپیزود شنیداری را با ${faDigits(stars)} ستاره تمام کردی. اپیزود بعدی منتظرت است.`,
        textEn: `You finished this listening episode with ${stars} star(s). The next episode is waiting.`,
      });
    }

    return ok({
      correct,
      total,
      stars,
      xpEarned,
      percent,
      bestResult: false,
    });
  } catch (e) {
    reportError(e, { route: "/api/listening/[id]", userId });
    return err("خطا در ثبت نتایج", 500);
  }
}
