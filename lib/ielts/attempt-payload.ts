import { scanCambridge } from "@/lib/b2-cambridge";
import { parseTestSlug, getTestById } from "@/lib/ielts/real-tests";
import { buildMediaInfo } from "@/lib/ielts/media-info";
import type { IeltsAttemptPayload } from "@/types/ielts";

// ========================================
// ساخت payload کامل یک تلاش آیلتس (سرور — v1.0.3.3)
// متادیتای تست + پاسخ‌های ذخیره‌شده + زمان باقی‌مانده +
// اطلاعات رسانه‌ای (PDF کتاب و فایل‌های صوتی از B2)
// ========================================

type AttemptRow = {
  id: string;
  testSlug: string;
  skill: string;
  mode: string;
  status: string;
  startedAt: Date;
};

export async function buildAttemptPayload(
  attempt: AttemptRow,
  savedAnswers: Record<string, string>,
  remainingSec: number | null,
): Promise<IeltsAttemptPayload | null> {
  const parsed = parseTestSlug(attempt.testSlug);
  if (!parsed) return null;
  const test = getTestById(parsed.bookNumber, parsed.testNumber);
  if (!test) return null;

  const skill = attempt.skill.toLowerCase() as IeltsAttemptPayload["skill"];
  const mode = attempt.mode.toLowerCase() as IeltsAttemptPayload["mode"];
  const scan = await scanCambridge();

  return {
    attemptId: attempt.id,
    slug: attempt.testSlug,
    bookNumber: test.bookNumber,
    testNumber: test.testNumber,
    skill,
    mode,
    status: attempt.status as IeltsAttemptPayload["status"],
    remainingSec,
    savedAnswers,
    media: buildMediaInfo(scan, test),
    reading: test.reading,
    listening: test.listening,
    writing: test.writing,
  };
}

/** ثانیه‌های باقی‌ماندهٔ حالت آزمون برای یک مهارت */
export function examRemainingSec(
  attempt: { startedAt: Date; mode: string; status: string },
  minutes: number,
): number | null {
  if (attempt.status !== "IN_PROGRESS" || attempt.mode !== "EXAM") return null;
  const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
  return Math.max(0, minutes * 60 - elapsed);
}

/** مدت‌زمان دقیقه‌ای مهارت یک تست */
export function skillMinutes(
  skill: "reading" | "listening" | "writing",
  test: { reading: { minutes: number }; listening: { minutes: number }; writing: { minutes: number } },
): number {
  return skill === "reading"
    ? test.reading.minutes
    : skill === "listening"
      ? test.listening.minutes
      : test.writing.minutes;
}
