import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";

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

    const result = episodes.map((ep) => ({
      id: ep.id,
      title: ep.title,
      titleFa: ep.titleFa,
      description: ep.description,
      audioUrl: ep.audioUrl,
      level: ep.level,
      duration: ep.duration,
      xp: ep.xp,
      order: ep.order,
      progress: ep.progress[0]
        ? {
            stars: ep.progress[0].stars,
            score: ep.progress[0].score,
            xpEarned: ep.progress[0].xpEarned,
            completedAt: ep.progress[0].completedAt?.toISOString() ?? null,
          }
        : null,
    }));

    return ok(result);
  } catch {
    return err("خطا در دریافت تمرین‌ها", 500);
  }
}
