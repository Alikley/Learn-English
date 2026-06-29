import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      lessons: {
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
        orderBy: { order: "asc" },
      },
      enrollments: {
        where: { userId },
        select: { progress: true, enrolledAt: true },
      },
    },
  });

  if (!course) return err("course not found", 404);

  return ok({
    ...course,
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
}

// ✅ این همون enroll درست
export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  const courseId = params.courseId;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) return err("course not found", 404);

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  });

  return ok({ enrollment }, 201);
}

// POST = complete lesson
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  const { lessonId, score } = await req.json();

  const progress = await prisma.lessonprogress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      isCompleted: true,
      completedAt: new Date(),
      score,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
      score,
    },
  });

  const totalLessons = await prisma.lesson.count({
    where: { courseId: params.courseId },
  });

  const completedLessons = await prisma.lessonprogress.count({
    where: {
      userId,
      isCompleted: true,
      lesson: { courseId: params.courseId },
    },
  });

  const courseProgress = Math.round((completedLessons / totalLessons) * 100);

  await prisma.enrollment.updateMany({
    where: { userId, courseId: params.courseId },
    data: { progress: courseProgress },
  });

  return ok({ progress, courseProgress });
}
