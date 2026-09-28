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
    audioTracks: tracks.map(cambridgeMediaUrl),
    audioShared,
    bucketName: scan.bucketName,
  };
}
