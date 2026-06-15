import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(level ? { level: level as never } : {}),
      },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
        enrollments: {
          where: {
            userId,
          },
          select: {
            progress: true,
            enrolledAt: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    const result = courses.map((c: (typeof courses)[number]) => ({
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
    }));

    return ok(result);
  } catch {
    return err("خطا در دریافت دوره‌ها", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  try {
    const { courseId } = await req.json();

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return err("دوره یافت نشد", 404);
    }

    const enrollment = await prisma.enrollment.upsert({
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

    return ok({ enrollment }, 201);
  } catch {
    return err("خطا در ثبت‌نام", 500);
  }
}
