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
// ========================================

import { existsSync } from "node:fs";
import { readFile as readFileAsync } from "node:fs/promises";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import { scanCambridge, signedCambridgeUrl } from "@/lib/b2-cambridge";

const PDF_TTL_MS = 20 * 60 * 1000;
const PAGES_TTL_MS = 30 * 60 * 1000;

export type PdfSourceKind = "b2" | "local" | null;

export type PdfResult =
  | { ok: true; buffer: Buffer; source: Exclude<PdfSourceKind, null>; filePath: string }
  | { ok: false; error: string };

type BufferCacheEntry = { buffer: Buffer; source: "b2" | "local"; filePath: string; expiresAt: number };
type PagesCacheEntry = { pages: string[]; expiresAt: number };

const bufferCache = new Map<number, BufferCacheEntry>();
const pagesCache = new Map<number, PagesCacheEntry>();

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

/** متن هر صفحهٔ PDF یک کتاب (کش ۳۰ دقیقه) */
export async function getBookPages(bookNumber: number, force = false): Promise<PagesResult> {
  const cached = pagesCache.get(bookNumber);
  if (!force && cached && Date.now() < cached.expiresAt) {
    const src = bufferCache.get(bookNumber)?.source ?? "b2";
    return { ok: true, pages: cached.pages, source: src };
  }

  const pdf = await getBookPdf(bookNumber);
  if (!pdf.ok) return { ok: false, error: pdf.error };

  try {
    const uint8 = new Uint8Array(pdf.buffer);
    const doc = await getDocumentProxy(uint8);
    const { text } = await extractText(doc, { mergePages: false });
    const pages = (Array.isArray(text) ? text : [text]).map((t) =>
      (t ?? "").replace(/\r/g, "").replace(/[ \t]+/g, " "),
    );
    pagesCache.set(bookNumber, { pages, expiresAt: Date.now() + PAGES_TTL_MS });
    return { ok: true, pages, source: pdf.source };
  } catch (error) {
    return {
      ok: false,
      error: `خواندن متن PDF ناموفق بود: ${error instanceof Error ? error.message : "خطای ناشناخته"}`,
    };
  }
}

/** شکستن کش (بعد از آپلود فایل جدید) */
export function invalidatePdfCache(bookNumber?: number): void {
  if (bookNumber == null) {
    bufferCache.clear();
    pagesCache.clear();
    return;
  }
  bufferCache.delete(bookNumber);
  pagesCache.delete(bookNumber);
}
