import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getTestBySlug, toSummary, countQuestions } from "@/lib/ielts/content";
import { prisma } from "@/prisma/Prisma client";

// ========================================
// GET /api/ielts/cambridge/[slug] — جزئیات یک آزمون (v1.0.3.2)
// خلاصهٔ مهارت‌ها (بدون محتوا و کلید پاسخ) + تلاش‌های کاربر
// ========================================

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { slug } = await params;
  const test = getTestBySlug(slug);
  if (!test) return err("آزمون یافت نشد", 404);

  const attempts = await prisma.ieltsAttempt.findMany({
    where: { userId: auth.session.user.id, testSlug: slug },
    orderBy: { startedAt: "desc" },
    select: {
      id: true, skill: true, mode: true, status: true,
      rawScore: true, totalQuestions: true, bandScore: true,
      startedAt: true, submittedAt: true, elapsedSec: true,
    },
  });

  return ok({
    test: toSummary(test),
    readingQuestions: countQuestions(test, "reading"),
    listeningQuestions: countQuestions(test, "listening"),
    // عنوان پاساژها/بخش‌ها فقط برای نمایش
    readingTopics: test.reading.passages.map((p) => p.title),
    listeningTopics: test.listening.sections.map((s) => s.title),
    writingTaskTypes: test.writing.tasks.map(
      (t) => (t.chart ? "Task 1 — Chart" : `Task ${t.taskNumber} — Essay`),
    ),
    attempts: attempts.map((a) => ({
      id: a.id,
      skill: a.skill.toLowerCase(),
      mode: a.mode.toLowerCase(),
      status: a.status,
      rawScore: a.rawScore,
      totalQuestions: a.totalQuestions,
      bandScore: a.bandScore,
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
      elapsedSec: a.elapsedSec,
    })),
  });
}
