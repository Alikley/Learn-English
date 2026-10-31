// ========================================
// OCR Sidecar — فایل «<نام PDF>.ocr.json» کنار خود PDF
// (سرور — v1.0.9.0 / English 1.0.2.8)
//
// ۱۸ کتاب از ۲۱ کتابِ باکت کمبریج «اسکن تصویری» هستند — لایهٔ متنی
// ندارند و استخراج متنشان تقریباً خالی است. اسکریپت آفلاین
// «scripts/ocr-book.mjs» (ویندوز — Tesseract) متن هر صفحه را می‌سازد
// و به‌صورت «<نام همان PDF>.ocr.json» کنار خود PDF می‌گذارد:
//
//   PDF محلی:   /data/ielts/16.pdf       →  /data/ielts/16.pdf.ocr.json
//   PDF باکت:   16/IELTS 16.pdf          →  16/IELTS 16.pdf.ocr.json
//
// این ماژول همان فایل را پیدا و می‌خواند:
//  - کنار PDF محلی (IELTS_PDF_DIR)
//  - کنار PDF در باکت B2 (همان باکت/پوشهٔ خود PDF)
// فرمت فایل: آرایه‌ای از رشته‌ها — متن هر صفحه به ترتیب صفحات،
// دقیقاً همان چیزی که getBookPages برمی‌گرداند (شیء {pages:[…]} هم
// پذیرفته می‌شود).
//
// getBookPages وقتی مجموع متن PDF کمتر از ۲۰۰ کاراکتر باشد اول
// sidecar را امتحان می‌کند؛ نبود → مسیر OCR بسته‌بندی‌شدهٔ قبلی
// (v1.0.8.8) → نبود → همان خطای «لایهٔ متنی ندارد».
//
// این ماژول فقط سمت سرور استفاده می‌شود.
// ========================================

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { scanCambridge, signedCambridgeUrl } from "@/lib/b2-cambridge";

export type OcrSidecar = { pages: string[]; where: string };

/** همان آستانهٔ «بی‌متن» در getBookPages */
const MIN_TOTAL_CHARS = 200;

/**
 * اعتبارسنجی و نرمال‌سازی متن sidecar.
 * نرمال‌سازی دقیقاً مثل استخراج خود PDF است (حذف \r و فشرده‌کردن
 * فاصله‌ها) تا مصرف‌کننده‌ها متن یکسانی ببینند.
 */
function parseSidecarPages(raw: unknown): string[] | null {
  let arr: unknown;
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as { pages?: unknown }).pages)
  ) {
    arr = (raw as { pages: unknown[] }).pages;
  }
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const pages = arr.map((p) => (typeof p === "string" ? p : ""));
  const total = pages.reduce((a, p) => a + p.trim().length, 0);
  if (total < MIN_TOTAL_CHARS) return null;

  return pages.map((t) => t.replace(/\r/g, "").replace(/[ \t]+/g, " "));
}

/** نام‌های ممکنی که sidecar کنار یک PDF محلی می‌تواند داشته باشد */
function localSidecarCandidates(pdfFilePath: string): string[] {
  const withoutExt = pdfFilePath.replace(/\.pdf$/i, "");
  return [
    `${pdfFilePath}.ocr.json`,
    `${withoutExt}.ocr.json`, // «16.pdf» → «16.ocr.json»
  ];
}

/** کلیدهای ممکنی که sidecar در باکت B2 می‌تواند داشته باشد */
function b2SidecarKeys(pdfPath: string): string[] {
  const withoutExt = pdfPath.replace(/\.pdf$/i, "");
  return [
    `${pdfPath}.ocr.json`,
    `${withoutExt}.ocr.json`,
  ];
}

/**
 * sidecar کنار یک PDF محلی — «بهترین تلاش»؛ نبودن خطا نیست.
 */
export async function findOcrSidecarLocal(pdfFilePath: string): Promise<OcrSidecar | null> {
  for (const candidate of localSidecarCandidates(pdfFilePath)) {
    try {
      if (!existsSync(candidate)) continue;
      const parsed: unknown = JSON.parse(await readFile(candidate, "utf8"));
      const pages = parseSidecarPages(parsed);
      if (!pages) continue;
      return { pages, where: candidate };
    } catch {
      /* فایل خراب/ناقص است — نام بعدی */
    }
  }
  return null;
}

/**
 * sidecar کنار یک PDF در باکت B2 — همان باکت و همان پوشهٔ خود PDF.
 * نام باکت از اسکن کش‌شده می‌آید؛ فایل‌های 404 یعنی «نبود».
 */
export async function findOcrSidecarB2(pdfPath: string): Promise<OcrSidecar | null> {
  try {
    const scan = await scanCambridge();
    if (!scan.configured || !scan.bucketName || scan.error) return null;
    for (const key of b2SidecarKeys(pdfPath)) {
      try {
        const url = await signedCambridgeUrl(scan.bucketName, key);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue; // 404 → کلید بعدی
        const parsed: unknown = JSON.parse(await res.text());
        const pages = parseSidecarPages(parsed);
        if (!pages) continue;
        return { pages, where: `${scan.bucketName}/${key}` };
      } catch {
        /* این کلید نه — کلید بعدی */
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * مسیر PDF یک کتاب در باکت B2 — بدون دانلود خود PDF (فقط از اسکنِ
 * کش‌شدهٔ ۵ دقیقه‌ای). برای وقتی خود PDF در دسترس نیست (قطعی/سهمیه)
 * ولی sidecar کوچکش ممکن است باشد.
 */
export async function b2PdfPathForBook(
  bookNumber: number,
): Promise<{ bucketName: string; pdfPath: string } | null> {
  try {
    const scan = await scanCambridge();
    if (!scan.configured || !scan.bucketName) return null;
    const pdfPath = scan.books[bookNumber]?.pdfPath;
    if (!pdfPath) return null;
    return { bucketName: scan.bucketName, pdfPath };
  } catch {
    return null;
  }
}

/**
 * sidecar مناسب برای یک PDF که «در دسترس و خوانده‌شده» است —
 * بسته به منبعش، پوشهٔ محلی یا باکت B2.
 */
export async function findOcrSidecar(
  source: "b2" | "local",
  pdfFilePath: string,
): Promise<OcrSidecar | null> {
  return source === "local"
    ? findOcrSidecarLocal(pdfFilePath)
    : findOcrSidecarB2(pdfFilePath);
}
