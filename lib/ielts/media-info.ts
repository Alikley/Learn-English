// ========================================
// ساخت اطلاعات رسانه‌ای یک تست آیلتس (سرور — v1.0.3.6)
// خروجی اسکن باکت B2 (lib/b2-cambridge) را به آدرس‌های
// پل رسانه‌ای /api/ielts/media برای یک تست خاص تبدیل می‌کند.
// اگر PDF در باکت نبود ولی پوشهٔ محلی IELTS_PDF_DIR
// داشت، PDF از /api/ielts/paper?book=N&pdf=1 سرو می‌شود.
//
// تقسیم فایل‌های صوتی بین ۴ تست هر کتاب:
//  - تعداد مضرب ۴ (۴/۸/۱۶/۳۲...) → به‌تساوی بین تست‌ها
//  - تعداد غیرقابل تقسیم → فهرست مشترک برای همهٔ تست‌ها
//    (کاربر مثل آزمون واقعی خودش ترتیب پخش را انتخاب می‌کند)
// ========================================

import type { CambridgeScan } from "@/lib/b2-cambridge";
import type { IeltsMediaInfo } from "@/types/ielts";
import type { IeltsRealTestMeta } from "@/lib/ielts/real-tests";
import { hasLocalPdf } from "@/lib/ielts/pdf-text";

/** ساخت آدرس پل رسانه‌ای از مسیر داخل باکت */
export function cambridgeMediaUrl(remotePath: string): string {
  const encoded = remotePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/api/ielts/media/${encoded}`;
}

/**
 * v1.0.9.1 (English 1.0.2.10): کلید استاندارد تصویر نمودار تسک ۱
 * رایتینگ در باکت — cambridge-writing/<book>-<test>-task1.jpg
 */
export function writingTask1ImageKey(bookNumber: number, testNumber: number): string {
  return `cambridge-writing/${bookNumber}-${testNumber}-task1.jpg`;
}

/**
 * v1.0.9.1: مسیر واقعی تصویر تسک ۱ در باکت (برای آدرس پل رسانه‌ای).
 * اول مسیر دقیق از اسکن (تأیید وجود فایل)؛ اگر کش اسکن قدیمی بود و
 * فیلد writingImages را نداشت، کلید استانداردِ ریشهٔ باکت ساخته می‌شود
 * — 🔧 رفع 1.0.2.9: بدون پیشوند cambridge/ (عکس‌های کاربر در ریشهٔ
 * باکت اصلی‌اند: cambridge-writing/<b>-<t>-task1.jpg — پیشوند اشتباه
 * باعث ۴۰۴ و بازگشت به PDF می‌شد).
 */
function writingTask1ImagePath(
  scan: CambridgeScan,
  bookNumber: number,
  testNumber: number,
): string | null {
  if (!scan.configured) return null;
  const standard = `${bookNumber}-${testNumber}-task1.jpg`;
  const found = scan.writingImages?.[standard];
  if (found) return found;
  return writingTask1ImageKey(bookNumber, testNumber);
}

export function buildMediaInfo(
  scan: CambridgeScan,
  test: IeltsRealTestMeta,
): IeltsMediaInfo {
  if (!scan.configured) {
    // B2 تنظیم نیست → شاید PDF محلی موجود باشد
    const localPdf = hasLocalPdf(test.bookNumber);
    return {
      configured: localPdf,
      error: null,
      pdfUrl: localPdf ? `/api/ielts/paper?book=${test.bookNumber}&pdf=1` : null,
      // v1.0.9.1: بدون B2 تصویر نمودار هم نیست (لینک امضادار لازم است)
      task1ImageUrl: null,
      audioTracks: [],
      audioShared: false,
      bucketName: null,
    };
  }

  const bookFiles = scan.books[test.bookNumber];
  const pdfUrl = bookFiles?.pdfPath
    ? cambridgeMediaUrl(bookFiles.pdfPath)
    : hasLocalPdf(test.bookNumber)
      ? `/api/ielts/paper?book=${test.bookNumber}&pdf=1`
      : null;

  // v1.0.9.1 (English 1.0.2.10): تصویر نمودار Writing Task 1 —
  // با همان هلپر pdfUrl (پل رسانه‌ای → لینک امضادار B2)
  const task1ImagePath = writingTask1ImagePath(scan, test.bookNumber, test.testNumber);
  const task1ImageUrl = task1ImagePath ? cambridgeMediaUrl(task1ImagePath) : null;

  const all = bookFiles?.audioFiles ?? [];
  let tracks = all;
  let audioShared = false;

  if (all.length > 0 && all.length % 4 === 0) {
    const perTest = Math.floor(all.length / 4);
    tracks = all.slice(
      (test.testNumber - 1) * perTest,
      test.testNumber * perTest,
    );
  } else if (all.length > 0) {
    audioShared = true;
  }

  return {
    configured: true,
    error: scan.error,
    pdfUrl,
    task1ImageUrl,
    audioTracks: tracks.map(cambridgeMediaUrl),
    audioShared,
    bucketName: scan.bucketName,
  };
}
