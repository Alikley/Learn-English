import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { NextRequest } from "next/server";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      include: {
        scores: {
          where: { userId },
          orderBy: { score: "desc" },
          take: 1,
        },
      },
    });

    const result = games.map((g: (typeof games)[number]) => ({
      id: g.id,
      title: g.title,
      type: g.type,
      description: g.description,
      bestScore: g.scores[0]?.score ?? 0,
      bestLevel: g.scores[0]?.level ?? 0,
    }));

    return ok(result);
  } catch {
    return err("خطا در دریافت بازی‌ها", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const { gameId, score, level } = await req.json();

    const gameScore = await prisma.gameScore.create({
      data: { userId, gameId, score, level: level ?? 1 },
    });

    const bestScore = await prisma.gameScore.findFirst({
      where: { userId, gameId },
      orderBy: { score: "desc" },
    });

    return ok(
      { gameScore, isNewRecord: score >= (bestScore?.score ?? 0) },
      201,
    );
  } catch {
    return err("خطا در ثبت امتیاز", 500);
  }
}
