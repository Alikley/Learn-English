import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/Prisma client";
import { requireAuth } from "@/lib/api-helpers";
import { notifyUser } from "@/lib/notify";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const userId = auth.session.user.id;
    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: "courseId missing" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            progress: {
              where: { userId },
              select: {
                isCompleted: true,
                completedAt: true,
                score: true,
              },
            },
          },
        },
        enrollments: {
          where: { userId },
          select: {
            progress: true,
            enrolledAt: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "course not found" }, { status: 404 });
    }

    const isEnrolled = course.enrollments.length > 0;

    return NextResponse.json({
      ...course,
      isEnrolled,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const userId = auth.session.user.id;
    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: "courseId missing" }, { status: 400 });
    }

    // v1.0.6.9 — فقط «شروع تازه» اعلان می‌گیرد (بازثبت‌نام نه)
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {},
      create: {
        userId,
        courseId,
      },
    });

    // v1.0.6.9 — اعلان شروع دوره (هرگز خطا نمی‌دهد)
    if (!existingEnrollment) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, titleEn: true },
      });
      if (course) {
        const titleEn = course.titleEn ?? course.title;
        await notifyUser(userId, {
          type: "course",
          link: "/courses",
          titleFa: `دورهٔ «${course.title}» شروع شد`,
          titleEn: `Course "${titleEn}" started`,
          textFa:
            "موفق باشی! درس‌های این دوره را یکی‌یکی جلو برو — پیشرفتت در صفحهٔ دوره ثبت می‌شود.",
          textEn:
            "Good luck! Work through the lessons one by one — your progress is tracked on the course page.",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

// ... GET و PATCH همون قبلی بمونن ...

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const userId = auth.session.user.id;
    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: "courseId missing" }, { status: 400 });
    }

    const body = await req.json();
    const { lessonId, score } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 },
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "not enrolled" }, { status: 403 });
    }

    await prisma.lessonprogress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        score: score ?? 100,
        xpEarned: 0,
      },
      create: {
        id: `${userId}-${lessonId}`,
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
        score: score ?? 100,
        xpEarned: 0,
      },
    });

    const totalLessons = await prisma.lesson.count({
      where: { courseId },
    });
    const completedLessons = await prisma.lessonprogress.count({
      where: {
        userId,
        lesson: { courseId },
        isCompleted: true,
      },
    });
    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { progress: progressPercent },
    });

    // ✅ آپدیت streak بعد از تکمیل درس
    const { updateStreak } = await import("@/lib/streak");
    await updateStreak(userId);

    // v1.0.6.9 — اعلان پایان دوره وقتی آخرین درس تمام شد (هرگز خطا نمی‌دهد)
    if (progressPercent === 100) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, titleEn: true },
      });
      if (course) {
        const titleEn = course.titleEn ?? course.title;
        await notifyUser(userId, {
          type: "course",
          link: "/courses",
          titleFa: `🎓 دورهٔ «${course.title}» کامل شد!`,
          titleEn: `🎓 Course "${titleEn}" completed!`,
          textFa:
            "تمام درس‌های این دوره را تمام کردی. یک دورهٔ جدید انتخاب کن تا یادگیری ادامه پیدا کند.",
          textEn:
            "You finished every lesson in this course. Pick a new course to keep the momentum going.",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      courseProgress: progressPercent,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
