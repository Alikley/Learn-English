import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const [enrollments, streak, recentProgress, notifications] =
      await Promise.all([
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                color: true,
                level: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
          take: 4,
        }),
        prisma.streak.findUnique({ where: { userId } }),
        prisma.lessonProgress.findMany({
          where: { userId, isCompleted: true },
          include: { lesson: { select: { title: true, courseId: true } } },
          orderBy: { completedAt: "desc" },
          take: 5,
        }),
        prisma.notification.findMany({
          where: { userId, isRead: false },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    const [totalLessonsCompleted, totalWordsLearned] = await Promise.all([
      prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
      prisma.vocabProgress.count({ where: { userId, isLearned: true } }),
    ]);

    return ok({
      enrollments,
      streak: streak ?? { current: 0, longest: 0 },
      recentProgress,
      notifications,
      stats: {
        totalLessonsCompleted,
        totalWordsLearned,
        totalCourses: enrollments.length,
      },
    });
  } catch {
    return err("خطا در دریافت اطلاعات داشبورد", 500);
  }
}
