// ========================================
// پاسخ‌نامهٔ خودکار از PDF (سرور — v1.0.3.6)
//
// بخش «Answer key» انتهای کتاب کمبریج خوانده و کش
// می‌شود؛ تحویل آزمون اول از این کلید استفاده می‌کند
// (پیش از آن، کلید دستی lib/ielts/keys.ts بررسی می‌شود).
// ========================================

import { getBookPages } from "@/lib/ielts/pdf-text";
import { parseAnswerKeys, type BookAnswerKeys } from "@/lib/ielts/paper-parser";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// v1.0.4.6 (English 1.0.0.10): پاسخ‌نامه‌ها به کش دو سطحی رفتند
const KEYS_TTL_S = 15 * 60;

/** پاسخ‌نامهٔ یک کتاب — از متن PDF، با کش ۱۵ دقیقه (L1 + Redis) */
export async function getBookAnswerKeys(
  bookNumber: number,
  force = false,
): Promise<BookAnswerKeys> {
  if (force) {
    await cacheDel(`keys:${bookNumber}`);
  } else {
    const cached = await cacheGet<BookAnswerKeys>(`keys:${bookNumber}`);
    if (cached) return cached;
  }

  const pagesResult = await getBookPages(bookNumber, force);
  let keys: BookAnswerKeys = {};
  if (pagesResult.ok) {
    keys = parseAnswerKeys(pagesResult.pages);
  }
  await cacheSet(`keys:${bookNumber}`, keys, KEYS_TTL_S);
  return keys;
}

/** کلید یک مهارت از یک تست — یا null */
export async function getPdfAnswerKey(
  bookNumber: number,
  testNumber: number,
  skill: "reading" | "listening",
  force = false,
): Promise<Record<string, string[]> | null> {
  const keys = await getBookAnswerKeys(bookNumber, force);
  const testKeys = keys[testNumber];
  if (!testKeys) return null;
  const key = skill === "reading" ? testKeys.reading : testKeys.listening;
  if (!key || Object.keys(key).length < 24) return null;
  return key;
}
