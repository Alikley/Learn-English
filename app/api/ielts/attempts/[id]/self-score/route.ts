import { requireAuth, ok, err } from "@/lib/api-helpers";
import { parseTestSlug, getTestById } from "@/lib/ielts/real-tests";
import { rawToBand } from "@/lib/ielts/grade";
import { prisma } from "@/prisma/prisma-client";
// v1.0.6.9 — اعلان ثبت نمرهٔ خودتصحیحی
import { notifyUser, faDigits } from "@/lib/notify";
// v1.0.5.0 (English 1.0.1.0): ولیدیشن zod بدنهٔ خودتصحیحی
import { validateJson, selfScoreSchema } from "@/lib/validation";

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

  // v1.0.5.0 — ولیدیشن zod (همان پیام قبلی)
  const parsedBody = await validateJson(req, selfScoreSchema);
  if (!parsedBody.ok) return parsedBody.response;
  const rawScore = parsedBody.data.rawScore;

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

  // v1.0.6.9 — اعلان ثبت نمرهٔ خودتصحیحی (هرگز خطا نمی‌دهد)
  const band = String(bandScore);
  await notifyUser(auth.session.user.id, {
    type: "ielts",
    link: "/ielts",
    titleFa: `نمرهٔ خودت ثبت شد — بند ${faDigits(band)}`,
    titleEn: `Self-score recorded — band ${band}`,
    textFa: `نمرهٔ خام ${faDigits(rawScore)} از ${faDigits(total)} ثبت شد و به بند ${faDigits(band)} تبدیل شد. نتیجهٔ کامل در صفحهٔ آزمون‌ها است.`,
    textEn: `Your raw score ${rawScore}/${total} was recorded as band ${band}. The full result is on the exams page.`,
  });

  return ok({
    id: attempt.id,
    rawScore,
    totalQuestions: total,
    bandScore,
    selfScored: true as const,
  });
}
