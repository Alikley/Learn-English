import { requireAuth, ok } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";

const CATEGORIES = [
  {
    key: "Grammar",
    title: "گرامر",
    image: "/assets/grammar.svg",
    color: "bg-blue-500",
  },
  {
    key: "Conversation",
    title: "مکالمه",
    image: "/assets/conversation.svg",
    color: "bg-teal-500",
  },
  {
    key: "Vocabulary",
    title: "لغات",
    image: "/assets/vocabulary.svg",
    color: "bg-purple-500",
  },
  {
    key: "Listening",
    title: "لیسنینگ",
    image: "/assets/listening.svg",
    color: "bg-orange-500",
  },
];

const ALL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.user.id;

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: {
      titleEn: true,
      level: true,
      enrollments: {
        where: { userId },
        select: { progress: true },
      },
    },
  });

  const result = CATEGORIES.map((cat) => {
    const matching = courses.filter((c) =>
      c.titleEn?.toLowerCase().includes(cat.key.toLowerCase()),
    );

    const avgProgress = Math.round(
      ALL_LEVELS.reduce((s, level) => {
        const course = matching.find((c) => c.level === level);
        return s + (course?.enrollments[0]?.progress ?? 0);
      }, 0) / ALL_LEVELS.length,
    );

    return { ...cat, avgProgress };
  });

  return ok(result);
}
