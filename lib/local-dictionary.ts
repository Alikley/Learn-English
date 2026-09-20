import { LESSONS as VOCAB_BEGINNER } from "@/data/lessons/vocabulary-beginner";
import { LESSONS as VOCAB_INTERMEDIATE } from "@/data/lessons/vocabulary-intermediate";
import { LESSONS as VOCAB_ADVANCED } from "@/data/lessons/vocabulary-advanced";
import { MEMORY_WORDS } from "@/data/memory/words";
import { SPEEDQUIZ_WORDS } from "@/data/speedquiz/questions";

// ========================================
// لغت‌نامه محلی (نسخه ۱.۰.۱.۸)
// فقط برای سرور — منبع ترجمهٔ فوری و آفلاین کلمه‌ها:
//   ۱) واژگان درس‌های لغت (۳۰۰ کلمه) — بالاترین اولویت
//   ۲) کلمات بازی حافظه (۳۸۲ کلمه)
//   ۳) کلمات کوییز سرعتی (۱۸۰ کلمه)
// اگر کلمه‌ای در چند منبع باشد، ترجمهٔ «درس» برنده است.
// مصرف‌کننده: /api/vocabulary/translate + افزودن کلمه به جعبه
// ========================================

const dict = new Map<string, string>();

// ۱) و ۲) — اول منابع کم‌اولویت
for (const w of MEMORY_WORDS) {
  const key = w.word?.trim().toLowerCase();
  if (key && w.translation) dict.set(key, w.translation);
}
for (const q of SPEEDQUIZ_WORDS) {
  const key = q.word?.trim().toLowerCase();
  if (key && q.translation) dict.set(key, q.translation);
}

// ۳) درس‌ها — آخر از همه یعنی بالاترین اولویت (رونویسی می‌کنند)
const vocabLessons = [...VOCAB_BEGINNER, ...VOCAB_INTERMEDIATE, ...VOCAB_ADVANCED];
for (const lesson of vocabLessons) {
  for (const w of lesson.words) {
    const key = w.word?.trim().toLowerCase();
    if (key && w.fa) dict.set(key, w.fa);
  }
}

/** تعداد کل مدخل‌های لغت‌نامه محلی */
export const localDictionarySize: number = dict.size;

/** جستجوی ترجمهٔ فارسی یک کلمهٔ انگلیسی — کلید باید lowercase باشد */
export function lookupLocalTranslation(word: string): string | null {
  const key = word?.trim().toLowerCase();
  if (!key) return null;
  return dict.get(key) ?? null;
}
