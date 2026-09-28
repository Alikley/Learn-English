// ========================================
// تایپ‌های بخش آیلتس (v1.0.3.3)
// آزمون‌های واقعی کمبریج: محتوای سوال‌ها داخل PDF کتاب
// (باکت B2 کاربر) است؛ این تایپ‌ها متادیتا، وضعیت فایل‌ها،
// تلاش‌ها و پاسخ‌برگ را پوشش می‌دهند.
// ========================================

/** مهارت‌های آزمون آیلتس */
export type IeltsSkill = "reading" | "listening" | "writing";

/** حالت انجام آزمون: تمرین (بدون محدودیت) / آزمون (شبیه‌سازی واقعی) */
export type IeltsMode = "practice" | "exam";

/** وضعیت تلاش */
export type IeltsAttemptStatus = "IN_PROGRESS" | "SUBMITTED";

// ---------- متادیتای کتاب/تست ----------

/** خلاصهٔ یک تست (۴ عدد در هر کتاب) */
export interface IeltsTestSummary {
  id: number; // 1..4
  slug: string; // "cambridge-01-t1"
  bookNumber: number;
  testNumber: number;
  reading: { questions: number; minutes: number; parts: number };
  listening: { questions: number; minutes: number; parts: number };
  writing: { tasks: number; minutes: number };
}

/** وضعیت فایل‌های یک کتاب در باکت B2 */
export interface IeltsBookFiles {
  pdf: boolean;
  pdfPath: string | null;
  audioCount: number;
}

/** نتیجهٔ اسکن سراسری باکت کمبریج */
export interface IeltsScanInfo {
  configured: boolean;
  source: "bucket" | "main-prefix" | null;
  bucketName: string | null;
  totalFiles: number;
  unmatchedFiles: number;
  error: string | null;
}

/** خلاصهٔ یک کتاب برای صفحهٔ فهرست */
export interface IeltsBookSummary {
  id: number; // 1..8
  slug: string; // "cambridge-01"
  titleFa: string;
  titleEn: string;
  tests: IeltsTestSummary[];
  files: IeltsBookFiles;
}

// ---------- تلاش‌ها ----------

/** خلاصهٔ تلاش (لیست نتایج) */
export interface IeltsAttemptSummary {
  id: string;
  slug: string;
  bookNumber: number;
  testNumber: number;
  skill: IeltsSkill;
  mode: IeltsMode;
  status: IeltsAttemptStatus;
  rawScore: number | null;
  totalQuestions: number | null;
  bandScore: number | null;
  selfScored: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  elapsedSec: number | null;
}

/** اطلاعات رسانه‌ای یک تلاش (خروجی اسکن B2) */
export interface IeltsMediaInfo {
  configured: boolean;
  error: string | null;
  /** آدرس پل رسانه‌ای PDF کتاب (قدیمی: null) */
  pdfUrl: string | null;
  /** فایل‌های صوتی این تست (آدرس پل رسانه‌ای) */
  audioTracks: string[];
  /** true اگر فایل‌های صوتی کتاب بین ۴ تست تقسیم‌نشده و مشترک‌اند */
  audioShared: boolean;
  bucketName: string | null;
}

/** محتوای پاس‌شده به کلاینت برای شروع/ادامهٔ تلاش */
export interface IeltsAttemptPayload {
  attemptId: string;
  slug: string;
  bookNumber: number;
  testNumber: number;
  skill: IeltsSkill;
  mode: IeltsMode;
  status: IeltsAttemptStatus;
  /** ثانیه‌های باقی‌مانده در حالت آزمون (سرور محاسبه می‌کند) */
  remainingSec: number | null;
  savedAnswers: Record<string, string>;
  media: IeltsMediaInfo;
  reading: { questions: number; minutes: number; parts: number };
  listening: { questions: number; minutes: number; parts: number };
  writing: { tasks: number; minutes: number };
}

/** نتیجهٔ تحویل آزمون */
export interface IeltsSubmitResult {
  skill: IeltsSkill;
  status: IeltsAttemptStatus;
  rawScore: number | null;
  totalQuestions: number | null;
  bandScore: number | null;
  /** true = کلید پاسخ نداریم؛ کاربر باید نمرهٔ خام را وارد کند */
  selfScoreRequired: boolean;
  elapsedSec: number | null;
  /** ریویو سوال به سوال — فقط وقتی کلید پاسخ موجود است */
  review?: {
    questionId: string;
    number: number;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
  /** متن‌های نوشته‌شدهٔ کاربر (رایتینگ) */
  writingSubmissions?: { questionId: string; text: string; wordCount: number }[];
}

/** نتیجهٔ ثبت نمرهٔ خودتصحیحی */
export interface IeltsSelfScoreResult {
  id: string;
  rawScore: number;
  totalQuestions: number;
  bandScore: number;
  selfScored: true;
}

// ========================================
// برگهٔ امتحانی تعاملی (v1.0.3.5)
// متن PDF کتاب به ساختار سوال/پاساژ تبدیل می‌شود تا
// کاربر «داخل خود برگهٔ امتحان» جواب بدهد — چیدمان
// تک‌ستونی و ریسپانسیو (مناسب موبایل).
// ========================================

/** نوع ورودی پاسخ */
export type PaperInputKind =
  | "text" // جای خالی متنی (تکمیل جمله/فرم/جدول/خلاصه)
  | "letters" // دکمه‌های حرف A/B/C/D… (چهارگزینه‌ای/مچینگ/پاراگراف)
  | "roman" // دکمه‌های عدد رومی i..viii (مچینگ تیتر)
  | "tfng" // TRUE / FALSE / NOT GIVEN
  | "ynng"; // YES / NO / NOT GIVEN

/** گزینهٔ یک سوال چهارگزینه‌ای یا بانک مچینگ */
export interface PaperOption {
  letter: string;
  text: string;
}

/**
 * یک واحد سوال. در آیلتس هر «جای خالی» دقیقاً یک شمارهٔ سوال است؛
 * بنابراین جمله‌ای با دو جای خالی که برچسب «1» دارد معمولاً
 * سوال‌های ۱ و ۲ را می‌پوشاند → numbers=[1,2].
 */
export interface PaperQuestionUnit {
  /** شماره(های) سوال به‌ترتیب جای خالی‌ها */
  numbers: number[];
  /** قطعه‌های متن بین ورودی‌ها — طول = تعداد ورودی + ۱ */
  segments: string[];
  inputKind: PaperInputKind;
  /** گزینه‌های همین سوال (چهارگزینه‌ای) */
  options?: PaperOption[];
}

/** یک دستهٔ سوال: «Questions 1–5» + دستور + سوال‌ها */
export interface PaperGroup {
  /** برچسب اصلی مثل «Questions 1–5» */
  label: string;
  /** خطوط دستور سوال */
  instruction: string[];
  /** بانک گزینه‌های مشترک دسته (مچینگ/تیتر) */
  bank?: PaperOption[];
  inputKind: PaperInputKind;
  /** حروف مجاز برای ورودی حرفی (letters/roman) */
  letters?: string[];
  questions: PaperQuestionUnit[];
}

/** بلوک‌های محتوای یک بخش — ترتیب واقعی حفظ می‌شود */
export type PaperBlock =
  | { type: "text"; lines: string[] } // پاساژ ریدینگ / زمینهٔ لیسنینگ / صورت تسک
  | { type: "group"; group: PaperGroup };

/** یک بخش: SECTION n / READING PASSAGE n / WRITING TASK n */
export interface PaperSection {
  title: string;
  blocks: PaperBlock[];
}

/** برگهٔ امتحانی تعاملی کامل */
export interface InteractivePaper {
  ok: boolean;
  reason: string | null;
  skill: IeltsSkill;
  bookId: number;
  testId: number;
  sections: PaperSection[];
  /** همهٔ شماره‌های سوالات پیداشده (مرتب صعودی) */
  questionNumbers: number[];
  /** بالاترین شمارهٔ سوال از برچسب دسته‌ها (معمولاً ۴۰) */
  maxQuestion: number;
  fromPage: number | null;
  toPage: number | null;
  totalPages: number | null;
}
