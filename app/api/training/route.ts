import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();

  if (error) {
    return error;
  }

  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const level = searchParams.get("level");

    const exercises = await prisma.exercise.findMany({
      where: {
        isPublished: true,
        ...(type ? { type: type as never } : {}),
        ...(level ? { level: level as never } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        level: true,
        xp: true,
        content: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return ok(exercises);
  } catch {
    return err("خطا در دریافت تمرین‌ها", 500);
  }
}
