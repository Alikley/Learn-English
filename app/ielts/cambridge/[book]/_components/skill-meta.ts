import { ClipboardList, Headphones, PenLine } from "lucide-react";
import type { IeltsAttemptSummary, IeltsSkill } from "@/types/ielts";

// ========================================
// متادیتای مهارت‌های آیلتس (v1.0.4.4 — کلین‌کد)
// آیکون/رنگ/برچسب سه مهارت + محاسبهٔ وضعیت هر مهارت از تلاش‌ها
// (مشترک بین TestBox و صفحهٔ کتاب — از [book]/page.tsx جدا شد)
//
// 🔢 v1.0.0.7 — ترتیب مهارت‌ها مثل آزمون واقعی آیلتس:
//    اول لیسنینگ، بعد ریدینگ، آخر رایتینگ
// ========================================

export const SKILLS: {
  key: IeltsSkill;
  fa: string;
  en: string;
  icon: typeof ClipboardList;
  color: "indigo" | "sky" | "emerald";
}[] = [
  { key: "listening", fa: "لیسنینگ", en: "Listening", icon: Headphones, color: "sky" },
  { key: "reading", fa: "ریدینگ", en: "Reading", icon: ClipboardList, color: "indigo" },
  { key: "writing", fa: "رایتینگ", en: "Writing", icon: PenLine, color: "emerald" },
];

export interface SkillStatus {
  state: "progress" | "done" | "none";
  best: number | null;
  count: number;
}

/** آخرین وضعیت یک مهارت از یک تست — از روی تلاش‌های کاربر */
export function skillStatus(
  attempts: IeltsAttemptSummary[],
  testId: number,
  skill: IeltsSkill | string,
): SkillStatus {
  const list = attempts.filter((a) => a.testNumber === testId && a.skill === skill);
  const inProgress = list.find((a) => a.status === "IN_PROGRESS");
  const submitted = list.find((a) => a.status === "SUBMITTED");
  const best = list.reduce<number | null>(
    (b, a) => (a.bandScore != null && (b == null || a.bandScore > b) ? a.bandScore : b),
    null,
  );
  return {
    state: inProgress ? "progress" : submitted ? "done" : "none",
    best,
    count: list.length,
  };
}
