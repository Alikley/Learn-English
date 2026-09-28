// ========================================
// ساخت اطلاعات رسانه‌ای یک تست آیلتس (سرور — v1.0.3.4)
// خروجی اسکن باکت B2 (lib/b2-cambridge) را به آدرس‌های
// پل رسانه‌ای /api/ielts/media برای یک تست خاص تبدیل می‌کند.
//
// تقسیم فایل‌های صوتی بین ۴ تست هر کتاب (به ترتیب اولویت):
//  ۱) نام فایل شمارهٔ تست را دارد («Test 2.mp3»، «listening-t3.mp3»)
//     → همان تست اختصاصی می‌شود؛ بقیهٔ فایل‌ها به همه مشترک
//  ۲) تعداد مضرب ۴ (۴/۸/۱۶/۳۲...) → به‌تساوی بین تست‌ها
//  ۳) تعداد غیرقابل تقسیم → فهرست مشترک برای همهٔ تست‌ها
//     (کاربر مثل آزمون واقعی خودش ترتیب پخش را انتخاب می‌کند)
// ========================================

import type { CambridgeScan } from "@/lib/b2-cambridge";
import type { IeltsMediaInfo } from "@/types/ielts";
import type { IeltsRealTestMeta } from "@/lib/ielts/real-tests";

/** ساخت آدرس پل رسانه‌ای از مسیر داخل باکت */
export function cambridgeMediaUrl(remotePath: string): string {
  const encoded = remotePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/api/ielts/media/${encoded}`;
}

/** آیا نام فایل شمارهٔ تست (۱..۴) را دارد؟ — «Test 2»، «t3»، «test-4» */
function testNumberFromName(name: string): number | null {
  const lower = name.toLowerCase();
  const full = lower.match(/(?:^|[^a-z])test[\s._-]*([1-4])(?![0-9])/);
  if (full) return Number(full[1]);
  // الگوی کوتاه tN — فقط وقتی بخشی مستقل باشد (نه part1!)
  const short = lower.match(/(?:^|[^a-z])t([1-4])(?![0-9a-z])/);
  if (short) return Number(short[1]);
  return null;
}

export function buildMediaInfo(
  scan: CambridgeScan,
  test: IeltsRealTestMeta,
): IeltsMediaInfo {
  if (!scan.configured) {
    return {
      configured: false,
      error: null,
      pdfUrl: null,
      audioTracks: [],
      audioShared: false,
      bucketName: null,
    };
  }

  const bookFiles = scan.books[test.bookNumber];
  const pdfUrl =
    bookFiles?.pdfPath ? cambridgeMediaUrl(bookFiles.pdfPath) : null;

  const all = bookFiles?.audioFiles ?? [];
  let tracks = all;
  let audioShared = false;

  if (all.length > 0) {
    // ۱) تقسیم بر اساس شمارهٔ تست در نام فایل
    const byTest: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [] };
    const extras: string[] = [];
    for (const f of all) {
      const t = testNumberFromName(f);
      if (t != null) byTest[t].push(f);
      else extras.push(f);
    }
    const namedCount = [1, 2, 3, 4].filter((t) => byTest[t].length > 0).length;

    if (namedCount === 4) {
      // همهٔ تست‌ها فایل اختصاصی دارند — مثل آزمون واقعی
      tracks = [...byTest[test.testNumber], ...extras];
      audioShared = false;
    } else if (namedCount > 0) {
      // تقسیم ناقص — فایل‌های اختصاصی این تست + همهٔ فایل‌های بی‌نام
      tracks = [...byTest[test.testNumber], ...extras];
      audioShared = byTest[test.testNumber].length === 0;
    } else if (all.length % 4 === 0) {
      // ۲) مضرب ۴ → برش مساوی
      const perTest = Math.floor(all.length / 4);
      tracks = all.slice(
        (test.testNumber - 1) * perTest,
        test.testNumber * perTest,
      );
    } else {
      // ۳) مشترک
      audioShared = true;
    }
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
