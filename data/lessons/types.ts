// ========================================
// انواع محتوای درس — v1.0.1.2
// منبع اصلی محتوای واقعی ۱۲۰ درس (۴ بخش × ۳ سطح × ۱۰ درس)
// سطح‌بندی CEFR: مبتدی=A1/A2، متوسط=B1/B2، پیشرفته=C1/C2
// ========================================

export type LessonKind =
  | "grammar"
  | "conversation"
  | "vocabulary"
  | "listening";

export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFR_LABEL: Record<Cefr, string> = {
  A1: "A1 — پایه",
  A2: "A2 — مقدماتی",
  B1: "B1 — متوسط",
  B2: "B2 — متوسط بالا",
  C1: "C1 — پیشرفته",
  C2: "C2 — تسلط کامل",
};

// ---------- مشترک ----------

export type QuizQuestion = {
  /** متن سؤال (فارسی) */
  question: string;
  /** گزینه‌ها */
  options: string[];
  /** اندیس گزینه صحیح */
  correctIndex: number;
  /** توضیح کوتاه بعد از پاسخ (فارسی) */
  explanation: string;
};

// ---------- گرامر ----------

export type GrammarFormRow = {
  /** نام الگو (فارسی) */
  label: string;
  /** الگوی ساختاری (انگلیسی) */
  pattern: string;
};

export type GrammarExample = {
  en: string;
  fa: string;
};

export type GrammarMistake = {
  wrong: string;
  right: string;
  note: string;
};

// v1.0.1.3 — بخش آموزشی مفهومی: هر درس گرامر
// به‌جای یک پاراگراف مختصر، چند بخش عمیق دارد
export type GrammarSection = {
  /** تیتر بخش (فارسی) */
  title: string;
  /** پاراگراف‌های آموزشی (فارسی، هر کدام ۳+ جمله با توضیح مفهومی) */
  paragraphs: string[];
  /** مثال‌های اختصاصی همین بخش */
  examples?: GrammarExample[];
};

export type GrammarLesson = {
  kind: "grammar";
  slug: string;
  titleFa: string;
  titleEn: string;
  cefr: Cefr;
  /** مقدمه فارسی — چرا این درس مهم است (۳+ جمله) */
  intro: string;
  /** بخش‌های آموزشی مفهومی و عمیق (۳-۴ بخش) */
  sections: GrammarSection[];
  /** خلاصه قانون در یک نگاه (جعبه طلایی) */
  rule: string;
  /** جدول ساختار */
  form: GrammarFormRow[];
  /** مثال‌ها (۸+) */
  examples: GrammarExample[];
  /** اشتباهات رایج (۴) */
  mistakes: GrammarMistake[];
  /** نکته‌های طلایی یادگیری (۴+) */
  tips: string[];
  /** آزمونک */
  quiz: QuizQuestion[];
};

// ---------- مکالمه ----------
// speaker=site → حباب قرمز (طرف مقابل = خود سایت)
// speaker=user → حباب آبی (نقش کاربر)

export type ConversationSpeaker = "site" | "user";

export type ConversationLine = {
  speaker: ConversationSpeaker;
  en: string;
  fa: string;
};

export type ConversationLesson = {
  kind: "conversation";
  slug: string;
  titleFa: string;
  titleEn: string;
  cefr: Cefr;
  /** شرح موقعیت (فارسی) */
  situation: string;
  /** خطوط مکالمه (۲۱-۲۶ خط) */
  lines: ConversationLine[];
  /** آزمونک درباره مکالمه */
  quiz: QuizQuestion[];
};

// ---------- لغات ----------

export type VocabWord = {
  word: string;
  /** نقش کلمه (فارسی): اسم / فعل / صفت ... */
  pos: string;
  /** معنی فارسی */
  fa: string;
  /** جمله نمونه انگلیسی */
  example: string;
  /** ترجمه جمله نمونه */
  exampleFa: string;
};

export type VocabularyLesson = {
  kind: "vocabulary";
  slug: string;
  titleFa: string;
  titleEn: string;
  cefr: Cefr;
  /** مقدمه فارسی */
  intro: string;
  /** ۱۰ کلمه */
  words: VocabWord[];
  /** آزمونک معنی‌ها */
  quiz: QuizQuestion[];
};

// ---------- لیسنینگ ----------

export type ListeningLesson = {
  kind: "listening";
  slug: string;
  titleFa: string;
  titleEn: string;
  cefr: Cefr;
  /** توضیح داستان (فارسی) */
  description: string;
  /** پاراگراف‌های داستان (۹-۱۱ پاراگراف، هر کدام < ۹۰۰ کاراکتر) */
  paragraphs: string[];
  /** واژگان کلیدی */
  keyVocab: { word: string; fa: string }[];
  /** سؤالات درک مطلب */
  quiz: QuizQuestion[];
};

export type LessonContent =
  | GrammarLesson
  | ConversationLesson
  | VocabularyLesson
  | ListeningLesson;

// ---------- مانیفست (برای seed) ----------

export type LessonManifestEntry = {
  slug: string;
  kind: LessonKind;
  /** شناسه دوره: مثل grammar-beginner */
  courseSlug: string;
  /** ترتیب ۱-۱۰ */
  order: number;
  titleFa: string;
  titleEn: string;
  cefr: Cefr;
  xp: number;
  durationMin: number;
};

export const KIND_LABEL: Record<LessonKind, string> = {
  grammar: "گرامر",
  conversation: "مکالمه",
  vocabulary: "لغات",
  listening: "لیسنینگ",
};
