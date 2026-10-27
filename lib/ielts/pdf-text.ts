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

const PDF_TTL_MS = 20 * 60 * 1000;
const PAGES_TTL_S = 30 * 60;

export type PdfSourceKind = "b2" | "local" | null;

export type PdfResult =
  | { ok: true; buffer: Buffer; source: Exclude<PdfSourceKind, null>; filePath: string }
  | { ok: false; error: string };

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
  | { ok: true; pages: string[]; source: "b2" | "local" }
  | { ok: false; error: string };

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

/** متن هر صفحهٔ PDF یک کتاب (کش ۳۰ دقیقه) */
export async function getBookPages(bookNumber: number, force = false): Promise<PagesResult> {
  if (!force) {
    const cached = await cacheGet<string[]>(`pdf:pages:${bookNumber}`);
    if (cached) {
      const src = bufferCache.get(bookNumber)?.source ?? "b2";
      return { ok: true, pages: cached, source: src };
    }
  } else {
    await cacheDel(`pdf:pages:${bookNumber}`);
  }

  const pdf = await getBookPdf(bookNumber);
  if (!pdf.ok) return { ok: false, error: pdf.error };

  silenceFontWarnings();
  try {
    const uint8 = new Uint8Array(pdf.buffer);
    const doc = await getDocumentProxy(uint8);
    const { text } = await extractText(doc, { mergePages: false });
    const pages = (Array.isArray(text) ? text : [text]).map((t) =>
      (t ?? "").replace(/\r/g, "").replace(/[ \t]+/g, " "),
    );
    // v1.0.4.6: ذخیره در کش دو سطحی (L1 + Redis)
    await cacheSet(`pdf:pages:${bookNumber}`, pages, PAGES_TTL_S);
    restoreConsole();
    return { ok: true, pages, source: pdf.source };
  } catch (error) {
    restoreConsole();
    return {
      ok: false,
      error: `خواندن متن PDF ناموفق بود: ${error instanceof Error ? error.message : "خطای ناشناخته"}`,
    };
  }

}

/** شکستن کش (بعد از آپلود فایل جدید) */
export async function invalidatePdfCache(bookNumber?: number): Promise<void> {
  if (bookNumber == null) {
    bufferCache.clear();
    await cacheDelPrefix("pdf:pages:");
    return;
  }
  bufferCache.delete(bookNumber);
  await cacheDel(`pdf:pages:${bookNumber}`);
}
