// ========================================
// تایپ‌های بخش آیلتس (v1.0.3.2)
// ساختار محتوا (کتاب کمبریج، آزمون، پاساژ، سوال، اسکریپت، رایتینگ)
// + ساختار تلاش‌های کاربر (attempt) که بین API و کلاینت جابه‌جا می‌شود
// ========================================

/** مهارت‌های آزمون آیلتس */
export type IeltsSkill = "reading" | "listening" | "writing";

/** حالت انجام آزمون: تمرین (بدون محدودیت زمان + پاسخ و تحلیل) / آزمون (شبیه‌سازی واقعی) */
export type IeltsMode = "practice" | "exam";

/** انواع سوال آیلتس که پلیر پشتیبانی می‌کند */
export type IeltsQuestionType =
  | "mcq" // چهارگزینه‌ای A-B-C(-D)
  | "tfng" // True / False / Not Given
  | "ynng" // Yes / No / Not Given
  | "match-headings" // عنوان پاراگراف (i, ii, iii...)
  | "match-info" // کدام پاراگراف شامل این اطلاعات است (A-H)
  | "match-features" // تطبیق گزاره‌ها با افراد/کشورها/ویژگی‌ها
  | "sentence-completion" // تکمیل جمله با محدودیت کلمات
  | "summary-completion" // خلاصه متن با جای خالی
  | "note-completion" // تکمیل یادداشت/نکته‌ها
  | "table-completion" // تکمیل جدول
  | "form-completion" // تکمیل فرم
  | "flow-completion" // تکمیل نمودار فرایندی
  | "short-answer"; // پاسخ کوتاه به سوال

/** گزینهٔ مشترک یک گروه سوال (مثلاً گزینه‌های A-D یک MCQ یا عنوان‌های i-x) */
export interface IeltsOption {
  label: string; // "A" | "i" | "Babylonians" | ...
  text: string; // متن گزینه
}

/** یک سوال */
export interface IeltsQuestion {
  /** شناسهٔ پایدار داخل آزمون — "r1".."r40" | "l1".."l40" | "w1" | "w2" */
  id: string;
  /** شمارهٔ نمایش داده‌شده ۱..۴۰ */
  number: number;
  /** صورت سوال / گزاره (برای tfng، match-info، short-answer و...) */
  text?: string;
  /** متن قبل از جای خالی (تکمیل‌ها) */
  before?: string;
  /** متن بعد از جای خالی */
  after?: string;
  /** گزینه‌های اختصاصی این سوال (اگر خالی بود از گزینه‌های گروه استفاده می‌شود) */
  options?: IeltsOption[];
  /** پاسخ‌های قابل قبول (نرمال‌سازی سمت سرور انجام می‌شود) */
  answer: string[];
  /** پاسخ نمایشی برای صفحهٔ نتیجه ("B" یا "Babylonians") */
  answerDisplay: string;
  /** توضیح کوتاه چرا این پاسخ درست است (حالت تمرین) */
  explanation?: string;
}

/** گروه سوال — سوال‌هایی که زیر یک دستور مشترک ("Questions 1-5") قرار دارند */
export interface IeltsQuestionGroup {
  id: string;
  /** شمارهٔ Part (۱..۳ ریدینگ | ۱..۴ لیسنینگ) */
  part: number;
  type: IeltsQuestionType;
  /** سرگروه: "Questions 1-4" */
  heading: string;
  /** دستور انگلیسی اصلی آزمون */
  instruction: string;
  /** محدودیت تعداد کلمات برای تکمیل‌ها ("NO MORE THAN TWO WORDS") */
  wordLimit?: string;
  /** گزینه‌های مشترک گروه (MCQ مشترک یا بانک عنوان‌ها/ویژگی‌ها) */
  options?: IeltsOption[];
  /** متن خط‌به‌خط زمینه برای تکمیل خلاصه (عنصر رشته یا جای خالی به شناسهٔ سوال) */
  lines?: (string | { gap: string })[];
  /** جدول زمینه برای تکمیل جدول/فرم (سلول رشته یا جای خالی) */
  table?: { headers: string[]; rows: (string | { gap: string })[][] };
  questions: IeltsQuestion[];
}

/** یک پاساژ ریدینگ */
export interface IeltsReadingPassage {
  part: number; // 1..3
  title: string;
  /** زیرعنوان/معرفی کوتاه */
  intro?: string;
  /** پاراگراف‌ها — label حروف A..H برای سوال‌های تطبیقی */
  paragraphs: { label?: string; text: string }[];
}

/** یک نوبت گفتار در اسکریپت لیسنینگ */
export interface IeltsScriptTurn {
  speaker: "WOMAN" | "MAN" | "NARRATOR";
  /** متن نوبت */
  text: string;
  /** مکث بعد از این نوبت (میلی‌ثانیه) — پیش‌فرض بر اساس نوع بخش */
  pauseAfterMs?: number;
}

/** یک بخش لیسنینگ */
export interface IeltsListeningSection {
  part: number; // 1..4
  /** عنوان داخلی بخش (برای ریویو، در آزمون نمایش داده نمی‌شود) */
  title: string;
  /** زمینهٔ موقعیت ("Conversation in a library") */
  context: string;
  /** فایل صوتی واقعی (B2) — اگر نبود، مرورگر متن را می‌خواند (speechSynthesis) */
  audioUrl?: string;
  /** مدت تخمینی بخش بر حسب ثانیه (نمایش) */
  estimatedSec: number;
  script: IeltsScriptTurn[];
}

/** نمودار تسک ۱ رایتینگ */
export interface IeltsChart {
  type: "bar" | "line" | "pie";
  title: string;
  /** واحدهای محور مقدار */
  unit?: string;
  /** دسته‌ها (bar/line: محور X، pie: برش‌ها) */
  categories: string[];
  /** سری‌های داده — pie فقط یک سری دارد */
  series: { name: string; values: number[] }[];
}

/** یک تسک رایتینگ */
export interface IeltsWritingTask {
  /** "w1" | "w2" */
  id: string;
  taskNumber: 1 | 2;
  /** زمان پیشنهادی دقیقه (۲۰ / ۴۰) */
  suggestedMinutes: number;
  minimumWords: number;
  prompt: string;
  /** نکات تکمیلی صورت سوال (bullets) */
  bullets?: string[];
  /** دادهٔ نمودار (تسک ۱) */
  chart?: IeltsChart;
  /** نمونه پاسخ سطح بالا (حالت تمرین) */
  sampleAnswer: string;
  /** چک‌لیست خودارزیابی */
  checklist: string[];
}

/** یک آزمون کامل (مثلاً کمبریج ۰۱ — تست ۱ آکادمیک) */
export interface IeltsTest {
  /** slug — "cambridge-01" */
  slug: string;
  bookNumber: number; // 1..8
  testNumber: number; // 1 (ساختار برای تست‌های بعدی آماده است)
  module: "ACADEMIC" | "GENERAL";
  titleFa: string;
  titleEn: string;
  available: boolean;
  reading: {
    passages: IeltsReadingPassage[];
    groups: IeltsQuestionGroup[]; // ۴۰ سوال
    minutes: number; // 60
  };
  listening: {
    sections: IeltsListeningSection[];
    groups: IeltsQuestionGroup[]; // ۴۰ سوال
    minutes: number; // ~30
  };
  writing: {
    tasks: IeltsWritingTask[];
    minutes: number; // 60
  };
}

/** خلاصهٔ مهارت برای صفحات لیست (بدون محتوا) */
export interface IeltsTestSummary {
  slug: string;
  bookNumber: number;
  testNumber: number;
  module: "ACADEMIC" | "GENERAL";
  titleFa: string;
  titleEn: string;
  available: boolean;
  readingCount: number;
  listeningCount: number;
  writingTasks: number;
  readingMinutes: number;
  listeningMinutes: number;
  writingMinutes: number;
}

/** پاسخ ذخیره‌شدهٔ کاربر برای یک سوال/تسک */
export interface IeltsAnswerValue {
  questionId: string;
  value: string;
}

/** وضعیت تلاش */
export type IeltsAttemptStatus = "IN_PROGRESS" | "SUBMITTED";

/** خلاصهٔ تلاش (لیست نتایج) */
export interface IeltsAttemptSummary {
  id: string;
  /** slug آزمون — فقط در پاسخ فهرست کتاب‌ها ارسال می‌شود */
  slug?: string;
  skill: IeltsSkill;
  mode: IeltsMode;
  status: IeltsAttemptStatus;
  rawScore: number | null;
  totalQuestions: number | null;
  bandScore: number | null;
  startedAt: string;
  submittedAt: string | null;
  elapsedSec: number | null;
}

/** محتوای پاس‌شده به کلاینت برای شروع/ادامهٔ تلاش (بدون کلید پاسخ در حالت آزمون) */
export interface IeltsClientQuestion extends Omit<IeltsQuestion, "answer" | "answerDisplay" | "explanation"> {
  /** فقط در حالت تمرین پر می‌شود */
  answer?: string[];
  answerDisplay?: string;
  explanation?: string;
}

export interface IeltsClientGroup extends Omit<IeltsQuestionGroup, "questions"> {
  questions: IeltsClientQuestion[];
}

export interface IeltsAttemptPayload {
  attemptId: string;
  slug: string;
  skill: IeltsSkill;
  mode: IeltsMode;
  status: IeltsAttemptStatus;
  /** ثانیه‌های باقی‌مانده در حالت آزمون (سرور محاسبه می‌کند) */
  remainingSec: number | null;
  savedAnswers: Record<string, string>;
  reading?: { passages: IeltsReadingPassage[]; groups: IeltsClientGroup[]; minutes: number };
  listening?: {
    sections: (Omit<IeltsListeningSection, "script"> & { script?: IeltsScriptTurn[] })[];
    groups: IeltsClientGroup[];
    minutes: number;
  };
  writing?: { tasks: IeltsWritingTask[]; minutes: number };
}

/** نتیجهٔ تصحیح یک تلاش */
export interface IeltsAttemptResult {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  skill: IeltsSkill;
  mode: IeltsMode;
  status: IeltsAttemptStatus;
  rawScore: number | null;
  totalQuestions: number | null;
  bandScore: number | null;
  startedAt: string;
  submittedAt: string | null;
  elapsedSec: number | null;
  /** ریویو سوال به سوال (بعد از submit) */
  review?: {
    questionId: string;
    number: number;
    part: number;
    type: IeltsQuestionType;
    yourAnswer: string;
    correctDisplay: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  /** متن‌های نوشته‌شدهٔ کاربر (رایتینگ) */
  writingSubmissions?: { questionId: string; text: string; wordCount: number }[];
}
