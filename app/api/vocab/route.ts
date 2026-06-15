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
    const category = searchParams.get("category");
    const mode = searchParams.get("mode");
    const now = new Date();

    const words = await prisma.vocabWord.findMany({
      where: {
        ...(level ? { level } : {}),
        ...(category ? { category } : {}),
        ...(mode === "review"
          ? {
              progress: {
                some: { userId, isLearned: true, nextReviewAt: { lte: now } },
              },
            }
          : mode === "new"
            ? { progress: { none: { userId } } }
            : {}),
      },
      include: {
        progress: {
          where: { userId },
          select: { isLearned: true, reviewCount: true, nextReviewAt: true },
        },
      },
      take: 20,
    });

    const result = words.map((w: (typeof words)[number]) => ({
      id: w.id,
      word: w.word,
      meaning: w.meaning,
      pronunciation: w.pronunciation,
      example: w.example,
      level: w.level,
      category: w.category,
      isLearned: w.progress[0]?.isLearned ?? false,
      reviewCount: w.progress[0]?.reviewCount ?? 0,
      nextReviewAt: w.progress[0]?.nextReviewAt ?? null,
    }));

    return ok(result);
  } catch {
    return err("خطا در دریافت لغات", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const { wordId, isLearned } = await req.json();

    const existing = await prisma.vocabProgress.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    const reviewCount = (existing?.reviewCount ?? 0) + 1;
    const daysUntilReview = Math.min(Math.pow(2, reviewCount - 1), 30);
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + daysUntilReview);

    const progress = await prisma.vocabProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      update: {
        isLearned,
        reviewCount,
        nextReviewAt: isLearned ? nextReviewAt : null,
        learnedAt: isLearned ? new Date() : null,
      },
      create: {
        userId,
        wordId,
        isLearned,
        reviewCount: 1,
        nextReviewAt: isLearned ? nextReviewAt : null,
        learnedAt: isLearned ? new Date() : null,
      },
    });

    return ok({ progress, nextReviewAt: isLearned ? nextReviewAt : null });
  } catch {
    return err("خطا در ثبت پیشرفت لغت", 500);
  }
}
