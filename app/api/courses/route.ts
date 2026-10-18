import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { NextRequest } from "next/server";
import { course_level } from "@prisma/client";
// v1.0.7.1 (English 1.0.1.14) — پارس query/بدنه با zod به‌جای دستی
import { validateQuery, validateJson, courseEnrollSchema } from "@/lib/validation";
import { z } from "zod";

// فیلتر سطح دوره — آسان‌گیر مثل قدیم: مقدار غایب/خالی/نامعتبر → بدون فیلتر
const COURSE_LEVELS = Object.values(course_level) as [course_level, ...course_level[]];
const courseLevelQuerySchema = z.object({
  level: z.preprocess(
    (v) => {
      if (typeof v !== "string" || v === "") return undefined;
      return (COURSE_LEVELS as readonly string[]).includes(v) ? v : undefined;
    },
    z.enum(COURSE_LEVELS).optional(),
  ),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  const qp = validateQuery(req, courseLevelQuerySchema);
  if (!qp.ok) return qp.response;
  const level = qp.data.level;

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

  const parsed = await validateJson(req, courseEnrollSchema);
  if (!parsed.ok) return parsed.response;
  const courseId = parsed.data.courseId;

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
