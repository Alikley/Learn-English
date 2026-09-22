// ========================================
// لغت‌نامه محلی — فقط سرور (نسخه ۱.۰.۱.۶ / بازیابی ۱.۰.۱.۸ / بازسازی ۱.۰.۲.۲)
// ادغام واژگان درس‌های لغت (۳۰۰) + کلمات بازی حافظه (۳۸۲)
// + کلمات کوییز سرعتی (۱۸۰) با اولویت درس‌ها
// ترجمه محلی = بدون نیاز به کلید AI؛ فقط برای APIهای سمت سرور
// ========================================

import { LESSONS as vocabBeginner } from "@/data/lessons/vocabulary-beginner";
import { LESSONS as vocabIntermediate } from "@/data/lessons/vocabulary-intermediate";
import { LESSONS as vocabAdvanced } from "@/data/lessons/vocabulary-advanced";
import type { VocabularyLesson } from "@/data/lessons/types";
import { MEMORY_WORDS } from "@/data/memory/words";
import { SPEEDQUIZ_WORDS } from "@/data/speedquiz/questions";

/** نقشه کلمه نرمال‌شده → ترجمه فارسی */
const DICTIONARY = new Map<string, string>();

function normalize(word: string): string {
  return word.trim().toLowerCase();
}

function addWord(word: string, translation: string) {
  const key = normalize(word);
  if (key && translation) {
    DICTIONARY.set(key, translation);
  }
}

// ---- ۱) کلمات بازی حافظه (پایین‌ترین اولویت) ----
for (const item of MEMORY_WORDS) {
  addWord(item.word, item.translation);
}

// ---- ۲) کلمات کوییز سرعتی ----
for (const item of SPEEDQUIZ_WORDS) {
  addWord(item.word, item.translation);
}

// ---- ۳) واژگان درس‌های لغت (بالاترین اولویت — بازنویسی بقیه) ----
const VOCAB_LESSON_SETS: VocabularyLesson[][] = [
  vocabBeginner,
  vocabIntermediate,
  vocabAdvanced,
];

for (const lessons of VOCAB_LESSON_SETS) {
  for (const lesson of lessons) {
    for (const w of lesson.words) {
      addWord(w.word, w.fa);
    }
  }
}

/**
 * جست‌وجوی ترجمه محلی کلمه انگلیسی
 * @returns ترجمه فارسی یا null اگر کلمه ناشناخته بود
 */
export function lookupLocalTranslation(word: string): string | null {
  const key = normalize(word ?? "");
  if (!key) return null;
  return DICTIONARY.get(key) ?? null;
}

/** تعداد مدخل‌های لغت‌نامه محلی */
export const localDictionarySize = DICTIONARY.size;
