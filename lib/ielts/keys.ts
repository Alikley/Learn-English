// ========================================
// کلیدهای پاسخ آزمون‌های کمبریج (اختیاری — v1.0.3.3)
//
// ⚠️ به‌صورت پیش‌فرض خالی است: چون پاسخ‌نامهٔ هر کتاب
// در «انتهای همان PDF» موجود است، جریان پیش‌فرض برنامه
// «خودتصحیحی» است — بعد از تحویل، کاربر پاسخ‌های درستش را
// از روی پاسخ‌نامهٔ کتاب می‌شمارد و عدد را وارد می‌کند؛
// برنامه بند را محاسبه و ذخیره می‌کند.
//
// ✅ اگر خواستی تصحیح «کاملاً خودکار» شود، کلید هر تست را
// اینجا اضافه کن — به محض وجود کلید، آن تست خودکار تصحیح
// می‌شود (بدون هیچ تغییر دیگری در کد).
//
// قالب: کلید = slug تست، مقدار = شمارهٔ سوال → پاسخ‌های قابل قبول
//   r1..r40 → ریدینگ | l1..l40 → لیسنینگ
//   (نرمال‌سازی حروف/فاصله/نقطه‌گذاری خودکار است)
//
// مثال:
//   "cambridge-01-t1": {
//     r1: ["B"], r2: ["vii"], r3: ["TRUE"],
//     l1: ["B"], l2: ["hall of residence"], ...
//   },
// ========================================

export type IeltsAnswerKey = Record<string, string[]>;

// ========================================
// Cambridge IELTS 4 — Test 1 — Listening
// (پاسخ‌نامهٔ رسمی کتاب — همهٔ حالت‌های قابل قبول)
// ========================================
const C04T1_LISTENING_KEY: IeltsAnswerKey = {
    l1: ["shopping", "variety of shopping"],
    l2: ["guided tours"],
    l3: ["more than 12", "over 12", "more than twelve", "over twelve"],
    l4: ["notice board"],
    l5: ["13th february", "february 13th", "13 february", "february 13"],
    l6: ["tower of london"],
    l7: ["bristol"],
    l8: ["american museum"],
    l9: ["student newspaper"],
    l10: ["yentob"],
    // سوال ۱۱ دو جای خالی دارد — هر دو با هم (به هر ترتیب) پذیرفته می‌شود
    l11: ["coal firewood", "firewood coal", "coal, firewood", "firewood, coal"],
    l12: ["local craftsmen"],
    l13: ["160"],
    l14: ["woodside"],
    l15: ["ticket office"],
    l16: ["gift shop"],
    l17: ["main workshop", "workshop"],
    l18: ["showroom"],
    l19: ["café", "cafe"],
    l20: ["cottages"],
    l21: ["a"],
    l22: ["c"],
    l23: ["e"],
    l24: ["b"],
    l25: ["g"],
    l26: ["f"],
    l27: ["c"],
    l28: ["d"],
    l29: ["a"],
    l30: ["b"],
    l31: ["cities", "environment"],
    l32: ["windy"],
    l33: ["humid"],
    l34: ["shady", "shaded"],
    l35: ["dangerous"],
    l36: ["leaves"],
    l37: ["ground"],
    l38: [
      "considerably reduce",
      "considerably decrease",
      "considerably filter",
      "reduce considerably",
    ],
    l39: ["low"],
    l40: ["space", "room"],
};

// v1.0.3.8: same key registered for book 1 AND book 4 — the structured
// C04T1 listening exam is startable from both book cards, and each
// attempt stores its own slug ("cambridge-01-t1" / "cambridge-04-t1").
export const IELTS_ANSWER_KEYS: Record<string, IeltsAnswerKey> = {
  "cambridge-01-t1": C04T1_LISTENING_KEY,
  "cambridge-04-t1": C04T1_LISTENING_KEY,
};

/** آیا برای این تست کلید پاسخ تعریف شده است؟ */
export function hasAnswerKey(slug: string): boolean {
  const key = IELTS_ANSWER_KEYS[slug];
  return !!key && Object.keys(key).length > 0;
}

/** کلید پاسخ یک تست (یا null) */
export function getAnswerKey(slug: string): IeltsAnswerKey | null {
  return IELTS_ANSWER_KEYS[slug] ?? null;
}
