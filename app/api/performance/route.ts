import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const [
      streak,
      enrollments,
      lessonsCompleted,
      wordsLearned,
      gameScores,
      weeklyActivity,
    ] = await Promise.all([
      prisma.streak.findUnique({ where: { userId } }),
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: { select: { title: true, level: true } } },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
      prisma.vocabProgress.count({ where: { userId, isLearned: true } }),
      prisma.gameScore.groupBy({
        by: ["gameId"],
        where: { userId },
        _max: { score: true },
      }),
      prisma.lessonProgress.findMany({
        where: {
          userId,
          isCompleted: true,
          completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { completedAt: true },
      }),
    ]);

    const activityMap: Record<string, number> = {};
    weeklyActivity.forEach((p: (typeof weeklyActivity)[number]) => {
      if (!p.completedAt) return;
      const day = p.completedAt.toISOString().split("T")[0];
      activityMap[day] = (activityMap[day] ?? 0) + 1;
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split("T")[0];
      return { date: key, count: activityMap[key] ?? 0 };
    });

    return ok({
      streak: streak ?? { current: 0, longest: 0 },
      enrollments,
      stats: {
        totalCourses: enrollments.length,
        averageProgress:
          enrollments.length > 0
            ? Math.round(
                enrollments.reduce(
                  (sum: number, e: (typeof enrollments)[number]) =>
                    sum + e.progress,
                  0,
                ) / enrollments.length,
              )
            : 0,
        lessonsCompleted,
        wordsLearned,
        totalGameSessions: gameScores.length,
      },
      weeklyActivity: last7Days,
    });
  } catch {
    return err("خطا در دریافت عملکرد", 500);
  }
}
