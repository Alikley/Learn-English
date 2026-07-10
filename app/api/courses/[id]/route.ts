import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/Prisma client";
import { requireAuth } from "@/lib/api-helpers";

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

    return NextResponse.json({
      ok: true,
      courseProgress: progressPercent,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
