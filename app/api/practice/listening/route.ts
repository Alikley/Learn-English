import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { PODCASTS } from "@/data/training/podcasts";
import type { ListeningItem } from "@/types/training";

// لیست تمرین شنیداری — ادغام قسمت‌های دیتابیس + پادکست‌های ایستا
// نسخه ۱.۰.۱.۴ — بدون تغییر دیتابیس

type ListItem = ListeningItem & {
  progress: { stars: number; score: number; xpEarned: number; completedAt: string | null } | null;
};

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const episodes = await prisma.listeningEpisode.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
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

    const dbItems: ListItem[] = episodes.map((ep) => ({
      id: ep.id,
      source: "db",
      title: ep.title,
      titleFa: ep.titleFa,
      description: ep.description,
      audioUrl: ep.audioUrl,
      level: ep.level,
      duration: ep.duration,
      xp: ep.xp,
      order: ep.order,
      topic: "آرشیو صوتی",
      progress: ep.progress[0]
        ? {
            stars: ep.progress[0].stars,
            score: ep.progress[0].score,
            xpEarned: ep.progress[0].xpEarned,
            completedAt:
              ep.progress[0].completedAt?.toISOString() ?? null,
          }
        : null,
    }));

    const podcastItems: ListItem[] = PODCASTS.map((p) => ({
      id: p.id,
      source: "podcast",
      title: p.title,
      titleFa: p.titleFa,
      description: p.description,
      audioUrl: p.audioUrl,
      level: p.level,
      duration: p.duration,
      xp: p.xp,
      order: p.order,
      topic: p.topic,
      progress: null, // پیشرفت پادکست‌ها در localStorage کاربر است
    }));

    const items = [...dbItems, ...podcastItems].sort(
      (a, b) => a.order - b.order,
    );

    return ok(items);
  } catch {
    return err("خطا در دریافت تمرین‌های شنیداری", 500);
  }
}
