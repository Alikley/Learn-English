import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/Prisma client";
import { requireAuth } from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const userId = auth.session.user.id;

    if (!params?.courseId) {
      return NextResponse.json({ error: "courseId missing" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
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
  { params }: { params: { courseId: string } },
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const userId = auth.session.user.id;
    const courseId = params.courseId;

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