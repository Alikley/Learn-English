import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

// GET — آمار داشبورد + اطلاعات کاربر
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const [user, enrollments, streak, monthlyProgress, categoryStats] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            phone: true,
            image: true,
          },
        }),
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                titleEn: true,
                level: true,
                imageUrl: true,
                color: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
        }),
        prisma.streak.findUnique({ where: { userId } }),
        // درس‌های تکمیل شده تو ۳۰ روز گذشته
        prisma.lessonprogress.findMany({
          where: {
            userId,
            isCompleted: true,
            completedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          select: {
            completedAt: true,
            xpEarned: true,
            lesson: { select: { title: true, courseId: true } },
          },
        }),
        // آمار هر دسته‌بندی
        prisma.course.findMany({
          where: { isPublished: true },
          include: {
            enrollments: { where: { userId }, select: { progress: true } },
            lessons: {
              select: {
                progress: {
                  where: { userId, isCompleted: true },
                  select: { id: true },
                },
              },
            },
          },
        }),
      ]);

    // محاسبه آمار ۳۰ روزه
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // نمودار فعالیت روزانه (۳۰ روز)
    const dailyActivity: { date: string; lessons: number; xp: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayLessons = monthlyProgress.filter(
        (p) =>
          p.completedAt && p.completedAt.toISOString().split("T")[0] === key,
      );
      dailyActivity.push({
        date: key,
        lessons: dayLessons.length,
        xp: dayLessons.reduce((s, l) => s + (l.xpEarned || 0), 0),
      });
    }

    // آمار هفتگی (4 هفته)
    const weeklyStats: { week: string; lessons: number; xp: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekLabel = `هفته ${4 - w}`;
      const weekLessons = monthlyProgress.filter((p) => {
        if (!p.completedAt) return false;
        return p.completedAt >= weekStart && p.completedAt < weekEnd;
      });
      weeklyStats.push({
        week: weekLabel,
        lessons: weekLessons.length,
        xp: weekLessons.reduce((s, l) => s + (l.xpEarned || 0), 0),
      });
    }

    // آمار دسته‌بندی‌ها
    const categoryMap: Record<
      string,
      { completed: number; total: number; progress: number }
    > = {};
    categoryStats.forEach((c) => {
      const titleEn = (c.titleEn || "").toLowerCase();
      let catKey = "سایر";
      if (titleEn.includes("grammar")) catKey = "گرامر";
      else if (titleEn.includes("conversation")) catKey = "مکالمه";
      else if (titleEn.includes("vocabulary") || titleEn.includes("vocab"))
        catKey = "لغات";
      else if (titleEn.includes("listening")) catKey = "لیسنینگ";

      if (!categoryMap[catKey])
        categoryMap[catKey] = { completed: 0, total: 0, progress: 0 };
      const completedCount = c.lessons.reduce(
        (s, l) => s + l.progress.length,
        0,
      );
      const totalCount = c.lessons.length;
      categoryMap[catKey].completed += completedCount;
      categoryMap[catKey].total += totalCount;
    });

    const categories = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      ...data,
      progress:
        data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    // کل آمار
    const totalLessons = monthlyProgress.length;
    const totalXP = monthlyProgress.reduce((s, l) => s + (l.xpEarned || 0), 0);
    const avgPerDay = Math.round((totalLessons / 30) * 10) / 10;

    return ok({
      user,
      enrollments,
      streak: streak ?? { current: 0, longest: 0 },
      stats: {
        totalLessonsThisMonth: totalLessons,
        totalXPThisMonth: totalXP,
        avgLessonsPerDay: avgPerDay,
        totalCourses: enrollments.length,
        avgProgress:
          enrollments.length > 0
            ? Math.round(
                enrollments.reduce((s, e) => s + e.progress, 0) /
                  enrollments.length,
              )
            : 0,
      },
      dailyActivity,
      weeklyStats,
      categories,
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    return err("خطا در دریافت اطلاعات داشبورد", 500);
  }
}

// PUT — آپدیت پروفایل (نام مستعار، شماره تلفن)
export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const body = await req.json();
    const { nickname, phone } = body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickname !== undefined ? { nickname } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    return ok(updated);
  } catch (e) {
    console.error("Profile update error:", e);
    return err("خطا در آپدیت پروفایل", 500);
  }
}
