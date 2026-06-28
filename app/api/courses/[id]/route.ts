import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

// GET /api/courses/[courseId] — جزئیات دوره + درس‌ها
export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        lessons: {
          include: {
            progress: {
              where: { userId },
              select: { isCompleted: true, completedAt: true, score: true },
            },
          },
          orderBy: { order: "asc" },
        },
        enrollments: {
          where: { userId },
          select: { progress: true, enrolledAt: true },
        },
      },
    });

    if (!course) return err("دوره یافت نشد", 404);

    return ok({
      id: course.id,
      title: course.title,
      titleEn: course.titleEn,
      description: course.description,
      level: course.level,
      imageUrl: course.imageUrl,
      color: course.color,
      isEnrolled: course.enrollments.length > 0,
      progress: course.enrollments[0]?.progress ?? 0,
      lessons: course.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        xp: l.xp,
        order: l.order,
        isCompleted: l.progress[0]?.isCompleted ?? false,
        completedAt: l.progress[0]?.completedAt ?? null,
        score: l.progress[0]?.score ?? null,
      })),
    });
  } catch {
    return err("خطا در دریافت دوره", 500);
  }
}

// POST /api/courses/[courseId] — تکمیل درس
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const { lessonId, score } = await req.json();

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { isCompleted: true, completedAt: new Date(), score },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
        score,
      },
    });

    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { courseId: params.courseId } }),
      prisma.lessonProgress.count({
        where: {
          userId,
          isCompleted: true,
          lesson: { courseId: params.courseId },
        },
      }),
    ]);

    const courseProgress = Math.round((completedLessons / totalLessons) * 100);

    await prisma.enrollment.updateMany({
      where: { userId, courseId: params.courseId },
      data: { progress: courseProgress },
    });

    // آپدیت streak
    const streak = await prisma.streak.findUnique({ where: { userId } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!streak) {
      await prisma.streak.create({ data: { userId, current: 1, longest: 1 } });
    } else {
      const last = new Date(streak.lastActiveAt);
      last.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - last.getTime()) / 86400000);
      const newCurrent =
        diff === 1 ? streak.current + 1 : diff > 1 ? 1 : streak.current;
      await prisma.streak.update({
        where: { userId },
        data: {
          current: newCurrent,
          longest: Math.max(newCurrent, streak.longest),
          lastActiveAt: new Date(),
        },
      });
    }

    return ok({ progress, courseProgress });
  } catch {
    return err("خطا در ثبت پیشرفت", 500);
  }
}

// PATCH /api/courses/[courseId] — ثبت‌نام در دوره
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
    });
    if (!course) return err("دوره یافت نشد", 404);

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: params.courseId } },
      update: {},
      create: { userId, courseId: params.courseId },
    });

    return ok({ enrollment }, 201);
  } catch {
    return err("خطا در ثبت‌نام", 500);
  }
}
