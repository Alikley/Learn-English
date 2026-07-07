import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";
import { course_level } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  const { searchParams } = new URL(req.url);
  const levelParam = searchParams.get("level");

  const isValidLevel = (v: string): v is course_level =>
    Object.values(course_level).includes(v as course_level);

  const level = levelParam && isValidLevel(levelParam) ? levelParam : undefined;

  const courses = await prisma.course.findMany({
    where: { isPublished: true, ...(level ? { level } : {}) },
    include: {
      _count: { select: { lessons: true } },
      enrollments: {
        where: { userId },
        select: { progress: true, enrolledAt: true },
      },
    },
    orderBy: { order: "asc" },
  });

  return ok(
    courses.map((c) => ({
      id: c.id,
      title: c.title,
      titleEn: c.titleEn,
      description: c.description,
      level: c.level,
      imageUrl: c.imageUrl,
      color: c.color,
      totalLessons: c._count.lessons,
      isEnrolled: c.enrollments.length > 0,
      progress: c.enrollments[0]?.progress ?? 0,
      enrolledAt: c.enrollments[0]?.enrolledAt ?? null,
    })),
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  const body = await req.json();
  const courseId = body?.courseId;

  if (!courseId) return err("courseId missing", 400);

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
