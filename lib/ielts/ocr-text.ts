// ========================================
// متن OCR کتاب‌های کمبریج — بارگذار (سرور — v1.0.8.8)
//
// منبع اول: رجیستری بسته‌بندی‌شده (data/ocr/cambridge/index.ts)
//  — با ایمپورت استاتیک باندل می‌شود و همه‌جا در دسترس است.
// منبع دوم: پوشهٔ فایل‌ها (پیش‌فرض data/ocr/cambridge یا
//  OCR_TEXT_DIR) — کتاب‌های جدیدی که با scripts/ocr-book.ts
//  ساخته‌اید بدون دست‌زدن به کد خوانده می‌شوند.
//
// این ماژول فقط سمت سرور استفاده می‌شود.
// ========================================

import { readFile } from "node:fs/promises";
import path from "node:path";
import { OCR_TEXT_BOOKS, type OcrTextBookData } from "@/data/ocr/cambridge";

/** فایل‌های OCR از حافظهٔ همین پروسه خوانده می‌شوند (متن‌ها بزرگ‌اند) */
const dirCache = new Map<number, OcrTextBookData | null>();

/** شمارهٔ کتاب‌هایی که متن OCR بسته‌بندی‌شده دارند */
export function bundledOcrBookNumbers(): number[] {
  return Object.keys(OCR_TEXT_BOOKS).map(Number);
}

/** پوشهٔ فایل‌های OCR (env OCR_TEXT_DIR — پیش‌فرض داخل پروژه) */
export function ocrTextDir(): string {
  return process.env.OCR_TEXT_DIR?.trim() || path.join(process.cwd(), "data", "ocr", "cambridge");
}

function isValidOcrBook(v: unknown): v is OcrTextBookData {
  if (!v || typeof v !== "object") return false;
  const pages = (v as { pages?: unknown }).pages;
  if (!Array.isArray(pages) || pages.length < 20) return false;
  const total = pages.reduce((a: number, p) => a + (typeof p === "string" ? p.length : 0), 0);
  return total > 5000;
}

/** فایل OCR از پوشه — بهترین تلاش؛ نبودن خطا نیست */
async function loadFromDir(bookNumber: number): Promise<OcrTextBookData | null> {
  try {
    const raw = JSON.parse(await readFile(path.join(ocrTextDir(), `${bookNumber}.json`), "utf8"));
    if (!isValidOcrBook(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

/**
 * متن OCR یک کتاب — رجیستری بسته‌بندی‌شده ارجح است؛ بعد از پوشهٔ
 * فایل‌ها (کتاب‌های drop-in). هیچ‌کدام نبود → null.
 */
export async function getOcrTextBook(bookNumber: number): Promise<OcrTextBookData | null> {
  const bundled = OCR_TEXT_BOOKS[bookNumber];
  if (bundled && isValidOcrBook(bundled)) return bundled;

  if (!dirCache.has(bookNumber)) {
    dirCache.set(bookNumber, await loadFromDir(bookNumber));
  }
  return dirCache.get(bookNumber) ?? null;
}

/**
 * شمارهٔ کتاب‌هایی که الان متن OCR دارند (رجیستری + پوشه در دسترس؟ —
 * فقط رجیستری؛ پوشه در هر سرور فرق دارد و برای وضعیتِ «آفلاین» به
 * رجیستری اکتفا می‌شود)
 */
export function hasBundledOcr(bookNumber: number): boolean {
  const bundled = OCR_TEXT_BOOKS[bookNumber];
  return Boolean(bundled && isValidOcrBook(bundled));
}
