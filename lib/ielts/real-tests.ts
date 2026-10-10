// ========================================
// متادیتای آزمون‌های واقعی کمبریج (v1.0.3.3)
//
// محتوای واقعی (PDF کتاب + فایل‌های صوتی) در باکت B2
// کاربر است و در زمان اجرا کشف می‌شود (lib/b2-cambridge).
// این فایل فقط «ساختار» هر کتاب/تست را تعریف می‌کند:
// شناسه‌ها، مدت‌زمان‌ها و تعداد سوال‌ها — فرمت استاندارد آیلتس.
//
// slug کتاب: «cambridge-01» .. «cambridge-21»
// slug تست:  «cambridge-01-t1» .. «cambridge-21-t4»
// اسلاگ‌های قدیمی (v1.0.3.2) مثل «cambridge-01» در تلاش‌های
// ذخیره‌شده به کتاب همان شماره و تست ۱ تفسیر می‌شوند.
// ========================================

export interface IeltsRealTestMeta {
  /** شناسهٔ عددی تست داخل کتاب — ۱..۴ */
  id: number;
  /** slug کامل — «cambridge-01-t1» */
  slug: string;
  bookNumber: number;
  testNumber: number;
  reading: { questions: number; minutes: number; parts: number };
  listening: { questions: number; minutes: number; parts: number };
  writing: { tasks: number; minutes: number };
}

export interface IeltsRealBookMeta {
  /** شناسهٔ عددی کتاب — ۱..۲۱ */
  id: number;
  /** slug کتاب — «cambridge-01» */
  slug: string;
  titleFa: string;
  titleEn: string;
  tests: IeltsRealTestMeta[];
}

function makeTest(bookNumber: number, testNumber: number): IeltsRealTestMeta {
  const bookSlug = `cambridge-${String(bookNumber).padStart(2, "0")}`;
  return {
    id: testNumber,
    slug: `${bookSlug}-t${testNumber}`,
    bookNumber,
    testNumber,
    reading: { questions: 40, minutes: 60, parts: 3 },
    listening: { questions: 40, minutes: 30, parts: 4 },
    writing: { tasks: 2, minutes: 60 },
  };
}

function makeBook(n: number): IeltsRealBookMeta {
  const padded = String(n).padStart(2, "0");
  return {
    id: n,
    slug: `cambridge-${padded}`,
    titleFa: `کمبریج آیلتس ${n}`,
    titleEn: `Cambridge IELTS ${n}`,
    tests: [1, 2, 3, 4].map((t) => makeTest(n, t)),
  };
}

/** ۲۱ کتاب × ۴ تست = ۸۴ آزمون (v1.0.4.4 — کتاب‌های ۹..۲۱ اضافه شدند) */
export const IELTS_BOOK_COUNT = 21;

export const IELTS_BOOKS: IeltsRealBookMeta[] = Array.from(
  { length: IELTS_BOOK_COUNT },
  (_, i) => makeBook(i + 1),
);

/** یافتن کتاب با شناسهٔ عددی */
export function getBookById(bookId: number): IeltsRealBookMeta | undefined {
  return IELTS_BOOKS.find((b) => b.id === bookId);
}

/** یافتن تست با کتاب + تست */
export function getTestById(
  bookId: number,
  testId: number,
): IeltsRealTestMeta | undefined {
  return getBookById(bookId)?.tests.find((t) => t.id === testId);
}

/**
 * تفسیر slug یک تلاش ذخیره‌شده.
 *  - «cambridge-03-t2» → کتاب ۳، تست ۲
 *  - «cambridge-03» (قدیمی v1.0.3.2) → کتاب ۳، تست ۱
 */
export function parseTestSlug(
  slug: string,
): { bookNumber: number; testNumber: number } | null {
  const m = slug.match(/^cambridge-(\d{2})(?:-t([1-4]))?$/i);
  if (!m) return null;
  const bookNumber = Number(m[1]);
  const testNumber = m[2] ? Number(m[2]) : 1;
  if (bookNumber < 1 || bookNumber > IELTS_BOOK_COUNT) return null;
  return { bookNumber, testNumber };
}

/** همهٔ slugهای یک کتاب (۴ تست + slug قدیمی کتاب برای تلاش‌های v1.0.3.2) */
export function bookSlugsForAttempts(bookId: number): string[] {
  const book = getBookById(bookId);
  if (!book) return [];
  return [book.slug, ...book.tests.map((t) => t.slug)];
}

/** عنوان نمایشی یک تلاش بر اساس slug */
export function attemptTitle(slug: string): string {
  const parsed = parseTestSlug(slug);
  if (!parsed) return slug;
  return `Cambridge ${String(parsed.bookNumber).padStart(2, "0")} — Test ${parsed.testNumber}`;
}
