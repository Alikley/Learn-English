import { NextRequest } from "next/server";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { getStreak } from "@/lib/streak";

// ========================================
// GET — دریافت تمام اطلاعات داشبورد
// ========================================
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    // ---- ۱. اطلاعات کاربر ----
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    // ---- ۲. ثبت‌نام‌ها + دوره‌ها ----
    const enrollments = await prisma.enrollment.findMany({
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
    });

    // ---- ۳. استریک ----
    const streak = await getStreak(userId);

    // ---- ۴. پیشرفت درس‌های ۳۰ روز گذشته ----
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyProgress = await prisma.lessonprogress.findMany({
      where: {
        userId,
        isCompleted: true,
        completedAt: { gte: thirtyDaysAgo },
      },
      select: {
        completedAt: true,
        xpEarned: true,
        lesson: {
          select: {
            courseId: true,
            course: {
              select: {
                titleEn: true,
              },
            },
          },
        },
      },
    });

    // ---- ۵. نمودار فعالیت روزانه (۳۰ روز) ----
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

    // ---- ۶. آمار هفتگی (۴ هفته) ----
    const weeklyStats: { week: string; lessons: number; xp: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);

      const weekLessons = monthlyProgress.filter((p) => {
        if (!p.completedAt) return false;
        return p.completedAt >= weekStart && p.completedAt < weekEnd;
      });

      weeklyStats.push({
        week: `هفته ${4 - w}`,
        lessons: weekLessons.length,
        xp: weekLessons.reduce((s, l) => s + (l.xpEarned || 0), 0),
      });
    }

    // ---- ۷. آمار دسته‌بندی‌ها ----
    // دریافت تمام دوره‌ها با تعداد درس‌ها و پیشرفت کاربر
    const coursesWithStats = await prisma.course.findMany({
      select: {
        titleEn: true,
        lessons: {
          select: {
            id: true,
            progress: {
              where: { userId, isCompleted: true },
              select: { id: true },
            },
          },
        },
      },
    });

    const categoryMap: Record<string, { completed: number; total: number }> =
      {};
    coursesWithStats.forEach((c) => {
      const titleEn = (c.titleEn || "").toLowerCase();
      let catKey = "سایر";
      if (titleEn.includes("grammar")) catKey = "گرامر";
      else if (titleEn.includes("conversation")) catKey = "مکالمه";
      else if (titleEn.includes("vocabulary") || titleEn.includes("vocab"))
        catKey = "لغات";
      else if (titleEn.includes("listening")) catKey = "لیسنینگ";

      if (!categoryMap[catKey])
        categoryMap[catKey] = { completed: 0, total: 0 };
      categoryMap[catKey].completed += c.lessons.reduce(
        (s, l) => s + l.progress.length,
        0,
      );
      categoryMap[catKey].total += c.lessons.length;
    });

    const categories = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      completed: data.completed,
      total: data.total,
      progress:
        data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));
    const listeningStats = await prisma.listeningProgress.groupBy({
      by: ["userId"],
      where: { userId },
      _sum: { xpEarned: true },
      _count: { id: true },
    });
    // ---- ۸. آمار کلی ----
    const totalLessons = monthlyProgress.length;
    const totalXP = monthlyProgress.reduce((s, l) => s + (l.xpEarned || 0), 0);
    const avgPerDay = Math.round((totalLessons / 30) * 10) / 10;

    const totalListeningXP = listeningStats[0]?._sum.xpEarned ?? 0;
    const completedListeningEpisodes = listeningStats[0]?._count.id ?? 0;

    return ok({
      user,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        progress: e.progress,
        course: e.course,
      })),
      streak,
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
        totalListeningXP, // ✅ اضافه شد
        completedListeningEpisodes, // ✅ اضافه شد
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

// ========================================
// PUT — آپدیت پروفایل (نام مستعار، تلفن)
// ========================================
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
