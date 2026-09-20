import { MEMORY_WORDS } from "@/data/memory/words";
import { SPEEDQUIZ_WORDS } from "@/data/speedquiz/questions";
import { LESSONS as VOCAB_LESSONS_BEGINNER } from "@/data/lessons/vocabulary-beginner";
import { LESSONS as VOCAB_LESSONS_INTERMEDIATE } from "@/data/lessons/vocabulary-intermediate";
import { LESSONS as VOCAB_LESSONS_ADVANCED } from "@/data/lessons/vocabulary-advanced";

// ========================================
// لغت‌نامه محلی (نسخه ۱.۰.۱.۶)
// فقط سمت سرور — هیچ چیزی از این ماژول به باندل کلاینت نمی‌رود
// منابع: واژگان درس‌ها (۳۰۰) + کلمات بازی حافظه (۳۸۲) + کلمات کوییز سرعتی (۱۸۰)
// اولویت: درس‌ها (استانداردترین) → حافظه → کوییز
// برای کلماتی که اینجا نباشند، /api/vocabulary/translate از هوش مصنوعی می‌پرسد
// ========================================

let cache: Map<string, string> | null = null;

function buildDictionary(): Map<string, string> {
  const dict = new Map<string, string>();

  // ۱) واژگان درس‌ها — word + fa
  const vocabLessons = [
    ...VOCAB_LESSONS_BEGINNER,
    ...VOCAB_LESSONS_INTERMEDIATE,
    ...VOCAB_LESSONS_ADVANCED,
  ];
  for (const lesson of vocabLessons) {
    for (const w of lesson.words) {
      const key = w.word.trim().toLowerCase();
      if (key && !dict.has(key)) dict.set(key, w.fa.trim());
    }
  }

  // ۲) کلمات بازی حافظه — word + translation
  for (const w of MEMORY_WORDS) {
    const key = w.word.trim().toLowerCase();
    if (key && !dict.has(key)) dict.set(key, w.translation.trim());
  }

  // ۳) کلمات کوییز سرعتی — word + translation
  for (const w of SPEEDQUIZ_WORDS) {
    const key = w.word.trim().toLowerCase();
    if (key && !dict.has(key)) dict.set(key, w.translation.trim());
  }

  return dict;
}

/** جست‌وجوی معنی فارسی یک کلمه انگلیسی در لغت‌نامه محلی */
export function lookupLocalTranslation(word: string): string | null {
  if (!cache) cache = buildDictionary();
  const key = word.trim().toLowerCase();
  if (!key) return null;
  return cache.get(key) ?? null;
}

/** تعداد مدخل‌های لغت‌نامه (برای لاگ/تست) */
export function localDictionarySize(): number {
  if (!cache) cache = buildDictionary();
  return cache.size;
}
