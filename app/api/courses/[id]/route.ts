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

  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: params.courseId },
      include: {
        progress: {
          where: { userId },
          select: { isCompleted: true, completedAt: true, score: true },
        },
      },
      orderBy: { order: "asc" },
    });

    const result = lessons.map((l: (typeof lessons)[number]) => ({
      id: l.id,
      title: l.title,
      duration: l.duration,
      xp: l.xp,
      order: l.order,
      isCompleted: l.progress[0]?.isCompleted ?? false,
      completedAt: l.progress[0]?.completedAt ?? null,
      score: l.progress[0]?.score ?? null,
    }));

    return ok(result);
  } catch {
    return err("خطا در دریافت درس‌ها", 500);
  }
}

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

    await updateStreak(userId);

    return ok({ progress, courseProgress });
  } catch {
    return err("خطا در ثبت پیشرفت", 500);
  }
}

async function updateStreak(userId: string) {
  const streak = await prisma.streak.findUnique({ where: { userId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!streak) {
    await prisma.streak.create({ data: { userId, current: 1, longest: 1 } });
    return;
  }

  const lastActive = new Date(streak.lastActiveAt);
  lastActive.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (today.getTime() - lastActive.getTime()) / 86400000,
  );

  let newCurrent = streak.current;
  if (diffDays === 1) newCurrent += 1;
  else if (diffDays > 1) newCurrent = 1;

  await prisma.streak.update({
    where: { userId },
    data: {
      current: newCurrent,
      longest: Math.max(newCurrent, streak.longest),
      lastActiveAt: new Date(),
    },
  });
}
