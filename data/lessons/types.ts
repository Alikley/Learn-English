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

export type GrammarLesson = {
  kind: "grammar";
  slug: string;
  titleFa: string;
  titleEn: string;
  cefr: Cefr;
  /** مقدمه فارسی (۲-۳ جمله) */
  intro: string;
  /** توضیح کامل قانون (فارسی، ۴-۶ جمله) */
  rule: string;
  /** جدول ساختار */
  form: GrammarFormRow[];
  /** مثال‌ها */
  examples: GrammarExample[];
  /** اشتباهات رایج */
  mistakes: GrammarMistake[];
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
  /** خطوط مکالمه (۱۴-۱۶ خط) */
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
