import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { PODCASTS } from "@/data/training/podcasts";
import { NextRequest } from "next/server";
import type { PodcastEpisode } from "@/types/training";

// جزئیات یک قسمت شنیداری — پادکست ایستا یا قسمت دیتابیس
// نسخه ۱.۰.۱.۴

type DetailItem = PodcastEpisode & {
  progress?: { stars: number; score: number; xpEarned: number; completedAt: string | null } | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ podId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { podId } = await params;

  // ۱) جستجو در پادکست‌های ایستا
  const podcast = PODCASTS.find((p) => p.id === podId);
  if (podcast) {
    const item: DetailItem = { ...podcast, progress: null };
    return ok(item);
  }

  // ۲) جستجو در دیتابیس
  try {
    const episode = await prisma.listeningEpisode.findUnique({
      where: { id: podId },
      include: {
        progress: {
          where: { userId: auth.session.user.id },
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

    const item: DetailItem = {
      id: episode.id,
      source: "db",
      title: episode.title,
      titleFa: episode.titleFa,
      description: episode.description,
      audioUrl: episode.audioUrl,
      level: episode.level,
      duration: episode.duration,
      xp: episode.xp,
      order: episode.order,
      topic: "آرشیو صوتی",
      transcript: episode.transcript,
      gaps: (episode.gaps as PodcastEpisode["gaps"]) ?? [],
      progress: episode.progress[0]
        ? {
            stars: episode.progress[0].stars,
            score: episode.progress[0].score,
            xpEarned: episode.progress[0].xpEarned,
            completedAt:
              episode.progress[0].completedAt?.toISOString() ?? null,
          }
        : null,
    };

    return ok(item);
  } catch {
    return err("خطا در دریافت تمرین", 500);
  }
}
