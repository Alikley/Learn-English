// ========================================
// تصحیح آزمون آیلتس (v1.0.3.2)
// - نرمال‌سازی پاسخ‌ها (حروف، فاصله‌ها، نقطه‌گذاری، گیومه)
// - جداول استاندارد تبدیل خام (از ۴۰) به بند (از ۹)
//   (تقریب رایج جدول‌های عمومی آیلتس آکادمیک)
// ========================================

/** نرمال‌سازی یک پاسخ برای مقایسه */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'") // گیومه‌های منحنی → مستقیم
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, "-") // خط تیره‌های بلند
    .replace(/[.,;:!?]+$/g, "") // نقطه‌گذاری انتهایی
    .replace(/\s+/g, " ")
    .replace(/\$/g, "");
}

/** بررسی درستی پاسخ کاربر نسبت به کلید */
export function isAnswerCorrect(userValue: string, accepted: string[]): boolean {
  const u = normalizeAnswer(userValue);
  if (!u) return false;
  return accepted.some((a) => normalizeAnswer(a) === u);
}

/** جدول تبدیل خام → بند (آستانهٔ حداقل خام → بند) */
const BAND_TABLE: readonly { min: number; band: number }[] = [
  { min: 39, band: 9 },
  { min: 37, band: 8.5 },
  { min: 35, band: 8 },
  { min: 33, band: 7.5 },
  { min: 30, band: 7 },
  { min: 27, band: 6.5 },
  { min: 23, band: 6 },
  { min: 19, band: 5.5 },
  { min: 15, band: 5 },
  { min: 13, band: 4.5 },
  { min: 10, band: 4 },
  { min: 8, band: 3.5 },
  { min: 6, band: 3 },
  { min: 4, band: 2.5 },
  { min: 3, band: 2 },
  { min: 1, band: 1 },
];

/** تبدیل نمرهٔ خام (۰..۴۰) به بند آیلتس — ریدینگ و لیسنینگ */
export function rawToBand(raw: number): number {
  if (raw <= 0) return 0;
  for (const row of BAND_TABLE) {
    if (raw >= row.min) return row.band;
  }
  return 1;
}

/** شمارش کلمات یک متن نوشتار */
export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}
