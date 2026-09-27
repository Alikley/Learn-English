import { requireAuth, ok, err } from "@/lib/api-helpers";
import { parseTestSlug, getTestById } from "@/lib/ielts/real-tests";
import { rawToBand } from "@/lib/ielts/grade";
import { prisma } from "@/prisma/Prisma client";

// ========================================
// POST /api/ielts/attempts/[id]/self-score (v1.0.3.3)
// ثبت نمرهٔ خام خودتصحیحی — کاربر بعد از تحویل، پاسخ‌های
// درستش را از روی پاسخ‌نامهٔ انتهای کتاب PDF می‌شمارد و
// عدد (۰..تعداد سوال) را اینجا ثبت می‌کند؛ بند محاسبه و
// ذخیره می‌شود (selfScored=true).
// ========================================

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const attempt = await prisma.ieltsAttempt.findUnique({
    where: { id },
  });
  if (!attempt) return err("تلاش یافت نشد", 404);
  if (attempt.userId !== auth.session.user.id) return err("دسترسی ندارید", 403);
  if (attempt.status !== "SUBMITTED") return err("ابتدا آزمون را تحویل دهید");

  const skill = attempt.skill.toLowerCase();
  if (skill !== "reading" && skill !== "listening")
    return err("خودتصحیحی فقط برای ریدینگ و لیسنینگ است");

  let body: { rawScore?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("درخواست نامعتبر است");
  }

  const rawScore = Number(body.rawScore);
  if (!Number.isInteger(rawScore) || rawScore < 0)
    return err("نمرهٔ خام نامعتبر است");

  const parsed = parseTestSlug(attempt.testSlug);
  if (!parsed) return err("آزمون یافت نشد", 404);
  const test = getTestById(parsed.bookNumber, parsed.testNumber);
  if (!test) return err("آزمون یافت نشد", 404);

  const total = skill === "reading" ? test.reading.questions : test.listening.questions;
  if (rawScore > total)
    return err(`نمرهٔ خام حداکثر ${total} است`);

  const bandScore = rawToBand(rawScore);

  await prisma.ieltsAttempt.update({
    where: { id: attempt.id },
    data: { rawScore, totalQuestions: total, bandScore, selfScored: true },
  });

  return ok({
    id: attempt.id,
    rawScore,
    totalQuestions: total,
    bandScore,
    selfScored: true as const,
  });
}
