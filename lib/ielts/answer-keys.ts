// ========================================
// پاسخ‌نامهٔ خودکار از PDF (سرور — v1.0.3.6)
//
// بخش «Answer key» انتهای کتاب کمبریج خوانده و کش
// می‌شود؛ تحویل آزمون اول از این کلید استفاده می‌کند
// (پیش از آن، کلید دستی lib/ielts/keys.ts بررسی می‌شود).
// ========================================

import { getBookPages } from "@/lib/ielts/pdf-text";
import { parseAnswerKeys, type BookAnswerKeys } from "@/lib/ielts/paper-parser";

const KEYS_TTL_MS = 15 * 60 * 1000;

const answerKeyCache = new Map<number, { keys: BookAnswerKeys; expiresAt: number }>();

/** پاسخ‌نامهٔ یک کتاب — از متن PDF، با کش ۱۵ دقیقه */
export async function getBookAnswerKeys(
  bookNumber: number,
  force = false,
): Promise<BookAnswerKeys> {
  const cached = answerKeyCache.get(bookNumber);
  if (!force && cached && Date.now() < cached.expiresAt) return cached.keys;

  const pagesResult = await getBookPages(bookNumber, force);
  let keys: BookAnswerKeys = {};
  if (pagesResult.ok) {
    keys = parseAnswerKeys(pagesResult.pages);
  }
  answerKeyCache.set(bookNumber, { keys, expiresAt: Date.now() + KEYS_TTL_MS });
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
