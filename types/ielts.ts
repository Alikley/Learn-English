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
  /** منبع تصحیح خودکار — کلید دستی یا پاسخ‌نامهٔ خود PDF کتاب */
  keySource?: "manual" | "ai" | "pdf" | null;
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

/**
 * خلاصهٔ نتیجهٔ یک تلاش تحویل‌شده (v1.0.4.2)
 * برای نمایش «نمای نتیجه» هنگام بازگشت به صفحهٔ آزمون
 */
export interface IeltsResultSummary {
  rawScore: number | null;
  totalQuestions: number | null;
  bandScore: number | null;
  selfScored: boolean | null;
}

// ---------- برگهٔ امتحان از متن PDF (v1.0.3.6) ----------

/** یک سوال واقعی از PDF کتاب */
export interface IeltsPaperQuestion {
  number: number;
  text: string;
  options?: { letter: string; text: string }[];
  inlineGap: boolean;
}

/** یک بخش برگه — SECTION/PART یا پاساژ + گروه سوال */
export interface IeltsPaperSection {
  title: string;
  questionRange: string | null;
  instruction: string;
  /** v1.0.4.0 — jabe gozine moshtarak bakh (matching box A-G) */
  optionsBox?: { letter: string; text: string }[];
  passageTitle?: string;
  passageBody?: string;
  questions: IeltsPaperQuestion[];
}

/** صورت تسک رایتینگ از PDF */
export interface IeltsWritingPrompt {
  task: 1 | 2;
  prompt: string;
  minWords: number;
}

/** برگهٔ امتحان ساخت‌یافته */
export type IeltsExamPaper =
  | {
      ok: true;
      skill: IeltsSkill;
      testNumber: number;
      sections: IeltsPaperSection[];
      writing?: IeltsWritingPrompt[];
      totalQuestions: number;
      source?: "b2" | "local";
      /** v1.0.4.0 — barghe ba AI sakhte shode va baraye hamishe cash shode */
      aiGenerated?: boolean;
    }
  | {
      ok: false;
      reason: string;
      source?: "b2" | "local";
      /** v1.0.4.0 — bargeh dar hale sakht ba AI — client bayad poll konad */
      generating?: boolean;
      /** v1.0.4.0 — ellate shekast sakhte hoshmand (vaghti be masire jaygozin raft) */
      aiError?: string;
    };
