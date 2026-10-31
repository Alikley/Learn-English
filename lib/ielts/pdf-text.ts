// ========================================
// متن‌کش PDF کتاب‌های کمبریج (سرور — v1.0.3.6)
//
// «برگه امتحان» مستقیماً از متن خود PDF ساخته می‌شود:
//  ۱) منبع اصلی: باکت B2 کاربر (lib/b2-cambridge)
//  ۲) منبع جایگزین: پوشهٔ محلی IELTS_PDF_DIR
//     (مثلاً /data/ielts با فایل‌هایی مثل 1.pdf یا book2.pdf)
//     — برای اجرای آفلاین/تست بدون B2
//
// بافر PDF ۲۰ دقیقه و متن صفحات ۳۰ دقیقه کش می‌شود.
// این ماژول فقط سمت سرور استفاده می‌شود.
//
// 🎯 v1.0.4.6 (English 1.0.0.10): متن صفحات به کش دو سطحی
//    (lib/cache — L1 + Redis) رفت تا بین instanceها مشترک شود.
//    «بافر باینری PDF» عمداً فقط در حافظهٔ همان پروسه می‌ماند:
//    هر کتاب ۵-۴۰MB است و گذاشتنش در Redis حافظهٔ بی‌دلیل
//    می‌گیرد؛ متن صفحات (خروجی گران استخراج) ارزش مشترک شدن
//    دارد.
// ========================================

import { existsSync } from "node:fs";
import { readFile as readFileAsync } from "node:fs/promises";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import { scanCambridge, signedCambridgeUrl } from "@/lib/b2-cambridge";
import { cacheGet, cacheSet, cacheDel, cacheDelPrefix } from "@/lib/cache";
import { getOcrTextBook } from "@/lib/ielts/ocr-text";
import { findOcrSidecar, findOcrSidecarB2, b2PdfPathForBook } from "@/lib/ielts/ocr-sidecar";

const PDF_TTL_MS = 20 * 60 * 1000;
const PAGES_TTL_S = 30 * 60;

export type PdfSourceKind = "b2" | "local" | null;

export type PdfResult =
  | { ok: true; buffer: Buffer; source: Exclude<PdfSourceKind, null>; filePath: string }
  | { ok: false; error: string };

export type PagesSource = "b2" | "local" | "ocr";

type BufferCacheEntry = { buffer: Buffer; source: "b2" | "local"; filePath: string; expiresAt: number };

// v1.0.4.6: بافر باینری فقط حافظهٔ همین پروسه (حجیم — توضیح بالا)؛
// متن صفحات از lib/cache می‌آید (L1 + Redis)
const bufferCache = new Map<number, BufferCacheEntry>();

// ---------- منبع محلی ----------

/** پوشهٔ فایل‌های PDF محلی (env IELTS_PDF_DIR) */
export function localPdfDir(): string | null {
  const dir = process.env.IELTS_PDF_DIR?.trim();
  return dir ? dir : null;
}

/** نام‌های ممکن برای کتاب n در پوشهٔ محلی */
function localPdfCandidates(bookNumber: number): string[] {
  const names = [
    `${bookNumber}.pdf`,
    `book${bookNumber}.pdf`,
    `book-${bookNumber}.pdf`,
    `cambridge${bookNumber}.pdf`,
    `cambridge-${bookNumber}.pdf`,
    `ielts${bookNumber}.pdf`,
    `ielts-${bookNumber}.pdf`,
    String(bookNumber).padStart(2, "0") + ".pdf",
    `book${String(bookNumber).padStart(2, "0")}.pdf`,
  ];
  const dir = localPdfDir();
  if (!dir) return [];
  return names.map((n) => path.join(dir, n));
}

/** آیا PDF این کتاب در پوشهٔ محلی موجود است؟ (برای نمایش وضعیت فایل‌ها) */
export function hasLocalPdf(bookNumber: number): boolean {
  return localPdfCandidates(bookNumber).some((p) => existsSync(p));
}

// ---------- دریافت بافر PDF ----------

async function fetchFromB2(bookNumber: number): Promise<{ buffer: Buffer; filePath: string } | null> {
  try {
    const scan = await scanCambridge();
    if (!scan.configured || scan.error) return null;
    const bookFiles = scan.books[bookNumber];
    if (!bookFiles?.pdfPath) return null;

    const url = await signedCambridgeUrl(scan.bucketName!, bookFiles.pdfPath);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) return null;
    return { buffer, filePath: bookFiles.pdfPath };
  } catch {
    return null;
  }
}

/**
 * بافر PDF یک کتاب — اول پوشهٔ محلی، بعد B2 (یا برعکس اگر
 * B2 کلید داشته باشد و فایل داشته باشد).
 * نتیجه کش می‌شود.
 */
export async function getBookPdf(bookNumber: number): Promise<PdfResult> {
  const cached = bufferCache.get(bookNumber);
  if (cached && Date.now() < cached.expiresAt) {
    return { ok: true, buffer: cached.buffer, source: cached.source, filePath: cached.filePath };
  }

  // ۱) پوشهٔ محلی
  for (const candidate of localPdfCandidates(bookNumber)) {
    try {
      const buffer = await readFileAsync(candidate);
      if (buffer.length > 1000) {
        bufferCache.set(bookNumber, {
          buffer,
          source: "local",
          filePath: candidate,
          expiresAt: Date.now() + PDF_TTL_MS,
        });
        return { ok: true, buffer, source: "local", filePath: candidate };
      }
    } catch {
      /* این نام نیست — نام بعدی */
    }
  }

  // ۲) باکت B2
  const fromB2 = await fetchFromB2(bookNumber);
  if (fromB2) {
    bufferCache.set(bookNumber, {
      buffer: fromB2.buffer,
      source: "b2",
      filePath: fromB2.filePath,
      expiresAt: Date.now() + PDF_TTL_MS,
    });
    return { ok: true, buffer: fromB2.buffer, source: "b2", filePath: fromB2.filePath };
  }

  return {
    ok: false,
    error: localPdfDir()
      ? `PDF کتاب ${bookNumber} نه در پوشهٔ محلی (${localPdfDir()}) و نه در باکت B2 پیدا شد`
      : `PDF کتاب ${bookNumber} در باکت B2 پیدا نشد (پوشهٔ محلی هم تنظیم نشده)`,
  };
}

// ---------- استخراج متن صفحات ----------

export type PagesResult =
  | { ok: true; pages: string[]; source: PagesSource; ocr?: boolean }
  | { ok: false; error: string };

/** شکل ذخیره‌شده در کش v2 (پرچم ocr و منبع هم زنده می‌مانند) */
type CachedPages = { pages: string[]; ocr: boolean; source: PagesSource };

// ========================================
// v1.0.8.8 (English 1.0.2.7) — ادغام متن OCR برای کتاب‌های اسکن‌شده
//
// ۱۸ کتاب از ۲۰ کتابِ باکت، اسکنِ تصویری هستند (بدون لایهٔ متنی) —
// ساخت برگهٔ AI و پاسخ‌نامه برایشان ممکن نبود. حالا متنِ OCRِ
// بسته‌بندی‌شدهٔ هر کتاب (data/ocr/cambridge — ساخته‌شده با یک مدل
// دیداری) در getBookPages با صفحاتِ بی‌متنِ PDF ادغام می‌شود:
//  - صفحه‌ای که خودش متن دارد (≥۵۰ کاراکتر) → دست‌نخورده
//  - صفحهٔ بی‌متن → متن OCR همان صفحه
//  - تعداد صفحات فرق داشته و PDF کاملاً بی‌متن است → کلِ صفحات OCR
// نتیجه در کلاین هم `ocr:true` اعلام می‌شود و کلید کش به نسخهٔ v2
// رفت تا کشِ قدیمیِ «صفحات خالی» به کاربر نچسبد.
//
// ========================================
// v1.0.9.0 (English 1.0.2.8) — OCR Sidecar: «<نام PDF>.ocr.json» کنار خود PDF
//
// ادغامِ بسته‌بندی‌شده برای «کتاب ۱۰» ساخته شده بود، ولی برای بقیهٔ
// ۱۷ کتابِ اسکن‌شده باید متن را بدون تغییر کد/ری‌دیپلوی می‌شد اضافه
// کرد. حالا اسکریپت آفلاین «scripts/ocr-book.mjs» (ویندوز — Tesseract،
// بدون ابزار سیستمی) متن هر صفحه را می‌سازد و فایل
// «<نام همان PDF>.ocr.json» را کنار خود PDF می‌گذارد (پوشهٔ محلی
// IELTS_PDF_DIR یا باکت B2 — همان پوشهٔ خود PDF). getBookPages وقتی
// مجموع متن PDF کمتر از ۲۰۰ کاراکتر بود اول همین فایل را برمی‌دارد:
//  - بود → متن‌هایش به‌عنوان صفحات کتاب برگردانده و مثل حالت عادی
//    کش می‌شود (پرچم ocr:true)
//  - نبود → مسیر v1.0.8.8 (OCR بسته‌بندی‌شده) → نبود → همان خطای
//    «لایهٔ متنی ندارد» قبلی می‌ماند
// کلید کش به v3 رفت تا کشِ قدیمیِ «صفحات خالی»ِ ۳۰ دقیقه‌ایِ نسل قبل
// برنگردد؛ نتیجهٔ «بی‌متن بدون OCR» هم دیگر فقط ۲ دقیقه کش می‌شود
// تا فایل sidecarِ تازه‌آپلودشده سریع‌تر دیده شود.
// ========================================

function pagesTotalChars(pages: string[]): number {
  return pages.reduce((a, p) => a + (p ?? "").trim().length, 0);
}

async function mergeOcrPages(
  bookNumber: number,
  pages: string[],
): Promise<{ pages: string[]; ocr: boolean }> {
  // متن کافی → کتابِ سمتِ متنی؛ کاری با OCR نداریم
  if (pagesTotalChars(pages) >= 200) return { pages, ocr: false };

  const ocrBook = await getOcrTextBook(bookNumber);
  if (!ocrBook || !Array.isArray(ocrBook.pages)) return { pages, ocr: false };

  // نسخهٔ متفاوت (تعداد صفحات فرق دارد) و PDF کاملاً بی‌متن →
  // کلِ متن OCR جایگزین می‌شود — شمارهٔ صفحات از خودِ OCR می‌آید
  if (ocrBook.pages.length !== pages.length) {
    return { pages: ocrBook.pages.map((p) => p ?? ""), ocr: true };
  }

  let replaced = 0;
  const merged = pages.map((pdfPage, i) => {
    const pdfText = (pdfPage ?? "").trim();
    if (pdfText.length >= 50) return pdfPage ?? "";
    const ocrPage = (ocrBook.pages[i] ?? "").trim();
    if (!ocrPage) return pdfPage ?? "";
    replaced++;
    return ocrPage;
  });
  return { pages: merged, ocr: replaced > 0 };
}

// v1.0.8.6 (English 1.0.2.5) — فیلتر موضعی هشدار فونت pdf.js
//
// کتاب‌های Cambridge از فونت‌های استانداردِ embed نشده (Helvetica و…)
// استفاده می‌کنند. pdf.js داخل unpdf برای این فونت‌ها دادهٔ استاندارد را
// لازم دارد و چون بیلد serverless آن نمی‌تواند فایل محلی (file://) بخواند،
// این هشدار در ترمینال چاپ می‌شود:
//   Warning: UnknownErrorException: Ensure that the `standardFontDataUrl`
//   API parameter is provided.
//
// 🎯 این هشدار «بی‌آسیب» است: استخراج متن کامل و موفق انجام می‌شود
// (کتاب ۱: ۱۶۲ صفحه / ۲۴۹ هزار کاراکتر) و فقط نگاشت تقریبی حروف فونت
// استاندارد را در پی دارد — همان رفتاری که همیشه بوده. ولی چون در ترمینال
// شبیه خطای اصلی می‌شود و کاربر را سردرگم می‌کند، فقط همین الگوی هشدارِ
// فونتِ مشخص، در بازهٔ استخراج بی‌صدا می‌شود. هر پیام دیگری از کنسول
// عبور می‌کند و استخراج هم‌زمان (سازگار با چند extract موازی) پشتیبانی
// می‌شود.

const FONT_WARN_RE = /standardFontDataUrl|Unable to load font data|cMapUrl/i;

type ConsoleMethods = {
  log: (typeof console)["log"];
  warn: (typeof console)["warn"];
  error: (typeof console)["error"];
};

let savedConsole: ConsoleMethods | null = null;
let fontSilenceDepth = 0;

function silenceFontWarnings(): void {
  if (fontSilenceDepth++ > 0) return; // extract موازی دیگر فیلتر را گذاشته
  const orig: ConsoleMethods = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  savedConsole = orig;
  const isFontWarning = (args: unknown[]) =>
    args.some((a) => typeof a === "string" && FONT_WARN_RE.test(a));
  console.log = (...a: unknown[]) => void (isFontWarning(a) || orig.log(...a));
  console.warn = (...a: unknown[]) => void (isFontWarning(a) || orig.warn(...a));
  console.error = (...a: unknown[]) => void (isFontWarning(a) || orig.error(...a));
}

function restoreConsole(): void {
  if (fontSilenceDepth > 0) fontSilenceDepth -= 1;
  if (fontSilenceDepth > 0) return; // extract موازی هنوز در جریان است
  if (savedConsole) {
    console.log = savedConsole.log;
    console.warn = savedConsole.warn;
    console.error = savedConsole.error;
    savedConsole = null;
  }
}

/**
 * متن هر صفحهٔ PDF یک کتاب (کش ۳۰ دقیقه).
 * v1.0.8.8 — صفحاتِ بی‌متن (کتاب اسکن) با OCR بسته‌بندی‌شده پر
 * می‌شوند؛ کلید کش نسخهٔ v2 است تا نتیجهٔ قدیمیِ بدون-OCR برنگردد.
 * v1.0.9.0 — اول «OCR sidecar» (فایل <نام همین PDF>.ocr.json کنار
 * خود PDF — پوشهٔ محلی یا باکت B2) امتحان می‌شود؛ بعد مسیر قبلی.
 * اگر خود PDF در دسترس نباشد (B2 قطع/سهمیهٔ روزانه/پوشهٔ محلی خالی)
 * ولی متن OCR باشد، صفحات کلاً از OCR خوانده می‌شود — یعنی برگهٔ
 * امتحان و پاسخ‌نامهٔ کتاب‌های OCRدار حتی بدون دانلودِ حتی یک بایت
 * از B2 ساخته می‌شوند (بافت/سهمیهٔ روزانهٔ B2 محفوظ می‌ماند).
 */
export async function getBookPages(bookNumber: number, force = false): Promise<PagesResult> {
  const cacheKey = `pdf:pages:v3:${bookNumber}`;
  if (!force) {
    const cached = await cacheGet<CachedPages>(cacheKey);
    if (cached?.pages) {
      return { ok: true, pages: cached.pages, source: cached.source, ocr: cached.ocr };
    }
  } else {
    await cacheDel(cacheKey);
    await cacheDel(`pdf:pages:v2:${bookNumber}`); // نسل قبل
    await cacheDel(`pdf:pages:${bookNumber}`); // نسل دو-قبل
  }

  const pdf = await getBookPdf(bookNumber);

  // ---------- مسیر OCR-first: PDF نیست ولی متن OCR هست ----------
  if (!pdf.ok) {
    // v1.0.9.0: اول sidecar — مسیر PDF از اسکن کش‌شده، بدون دانلود PDF
    const b2ref = await b2PdfPathForBook(bookNumber);
    if (b2ref) {
      const sidecar = await findOcrSidecarB2(b2ref.pdfPath);
      if (sidecar) {
        const result: CachedPages = { pages: sidecar.pages, ocr: true, source: "ocr" };
        await cacheSet(cacheKey, result, PAGES_TTL_S);
        return { ok: true, ...result };
      }
    }
    const ocrBook = await getOcrTextBook(bookNumber);
    if (ocrBook && Array.isArray(ocrBook.pages) && ocrBook.pages.length >= 20) {
      const result: CachedPages = { pages: ocrBook.pages.map((p) => p ?? ""), ocr: true, source: "ocr" };
      await cacheSet(cacheKey, result, PAGES_TTL_S);
      return { ok: true, ...result };
    }
    return { ok: false, error: pdf.error };
  }

  silenceFontWarnings();
  let rawPages: string[] | null = null;
  try {
    const uint8 = new Uint8Array(pdf.buffer);
    const doc = await getDocumentProxy(uint8);
    const { text } = await extractText(doc, { mergePages: false });
    rawPages = (Array.isArray(text) ? text : [text]).map((t) =>
      (t ?? "").replace(/\r/g, "").replace(/[ \t]+/g, " "),
    );
  } catch (error) {
    restoreConsole();
    // v1.0.9.0: استخراج خراب ولی sidecar کنار خود PDF هست → کافی است
    const sidecar = await findOcrSidecar(pdf.source, pdf.filePath);
    if (sidecar) {
      const result: CachedPages = { pages: sidecar.pages, ocr: true, source: "ocr" };
      await cacheSet(cacheKey, result, PAGES_TTL_S);
      return { ok: true, ...result };
    }
    // v1.0.8.8: OCR بسته‌بندی‌شده → همان کافی است
    const ocrBook = await getOcrTextBook(bookNumber);
    if (ocrBook && Array.isArray(ocrBook.pages) && ocrBook.pages.length >= 20) {
      const result: CachedPages = { pages: ocrBook.pages.map((p) => p ?? ""), ocr: true, source: "ocr" };
      await cacheSet(cacheKey, result, PAGES_TTL_S);
      return { ok: true, ...result };
    }
    return {
      ok: false,
      error: `خواندن متن PDF ناموفق بود: ${error instanceof Error ? error.message : "خطای ناشناخته"}`,
    };
  }
  restoreConsole();

  // v1.0.9.0 (English 1.0.2.8) — OCR sidecar اولویت اول:
  // PDF بی‌متن است و «<نام همین PDF>.ocr.json» کنار خودش هست؟
  // → متن‌های همان فایل به‌عنوان صفحات کتاب (مثل حالت عادی کش می‌شود)
  let finalPages = rawPages;
  let usedOcr = false;
  if (pagesTotalChars(rawPages) < 200) {
    const sidecar = await findOcrSidecar(pdf.source, pdf.filePath);
    if (sidecar) {
      finalPages = sidecar.pages;
      usedOcr = true;
    }
  }

  // v1.0.8.8 — نبود sidecar → ادغام OCR بسته‌بندی‌شده (کتاب ۱۰)
  if (!usedOcr) {
    const merged = await mergeOcrPages(bookNumber, finalPages);
    finalPages = merged.pages;
    usedOcr = merged.ocr;
  }

  // v1.0.9.0: ذخیره در کش دو سطحی — نتیجهٔ «بی‌متن بدون OCR» فقط
  // ۲ دقیقه کش می‌شود تا فایل sidecarِ تازه‌آپلودشده دیر نچسبد
  const result: CachedPages = { pages: finalPages, ocr: usedOcr, source: pdf.source };
  const textless = !usedOcr && pagesTotalChars(finalPages) < 200;
  await cacheSet(cacheKey, result, textless ? 120 : PAGES_TTL_S);
  return { ok: true, ...result };
}

/** شکستن کش (بعد از آپلود فایل جدید) */
export async function invalidatePdfCache(bookNumber?: number): Promise<void> {
  if (bookNumber == null) {
    bufferCache.clear();
    await cacheDelPrefix("pdf:pages:"); // کلیدهای همهٔ نسل‌ها (v1/v2/v3)
    return;
  }
  bufferCache.delete(bookNumber);
  await cacheDel(`pdf:pages:v3:${bookNumber}`);
  await cacheDel(`pdf:pages:v2:${bookNumber}`); // نسل قبل
  await cacheDel(`pdf:pages:${bookNumber}`); // نسل دو-قبل
}
