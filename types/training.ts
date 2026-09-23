// ========================================
// انواع بخش تمرین (نسخه ۱.۰.۱.۴)
// شنیداری (دیتابیس + پادکست) — گرامری — نوشتاری
// ========================================

/* ---------- تمرین شنیداری ---------- */

export type ListeningGap = {
  id: number;
  answer: string;
  hint: string;
};

/** پادکست ایستا (بدون فایل صوتی — با تلفظ مرورگر پخش می‌شود) */
export type PodcastEpisode = {
  id: string;
  source: "db" | "podcast";
  title: string;
  titleFa: string;
  description: string;
  audioUrl: string | null;
  level: string;
  duration: number;
  xp: number;
  order: number;
  transcript: string;
  gaps: ListeningGap[];
  topic: string;
};

/** آیتم لیست شنیداری (دیتابیس یا پادکست) */
export type ListeningItem = {
  id: string;
  source: "db" | "podcast";
  title: string;
  titleFa: string;
  description: string;
  audioUrl: string | null;
  level: string;
  duration: number;
  xp: number;
  order: number;
  topic: string;
};

export type ListeningSubmitResult = {
  correct: number;
  total: number;
  stars: number;
  xpEarned: number;
  percent: number;
  bestResult: boolean;
};

/* ---------- تمرین گرامری ---------- */

export type GrammarLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type GrammarQuestionType = "MCQ" | "FILL" | "ERROR";

export type GrammarQuestion = {
  id: number;
  type: GrammarQuestionType;
  /** صورت سؤال (برای ERROR: جمله نادرست یا «کدام جمله صحیح است؟») */
  question: string;
  /** گزینه‌ها — فقط برای MCQ و ERROR (جمله‌ها) */
  options: string[];
  /** جواب صحیح */
  answer: string;
  /** توضیح کوتاه فارسی بعد از پاسخ */
  explanation: string;
};

export type GrammarSetMeta = {
  id: string;
  level: GrammarLevel;
  topicFa: string;
  topicEn: string;
  description: string;
  questionCount: number;
  xp: number;
  icon: string;
};

export type GrammarSet = GrammarSetMeta & {
  questions: GrammarQuestion[];
};

export type GrammarSubmitResult = {
  correct: number;
  total: number;
  stars: number;
  xpEarned: number;
  percent: number;
  /** نتیجه تک‌تک سؤال‌ها به ترتیب */
  results: {
    id: number;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  }[];
};

export const GRAMMAR_LEVEL_LABEL: Record<GrammarLevel, string> = {
  BEGINNER: "مبتدی",
  INTERMEDIATE: "متوسط",
  ADVANCED: "پیشرفته",
};

// v1.0.2.3 — گام ۳: برچسب انگلیسی سطح گرامر
export const GRAMMAR_LEVEL_LABEL_EN: Record<GrammarLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const GRAMMAR_LEVEL_COLOR: Record<GrammarLevel, string> = {
  BEGINNER: "bg-green-100 text-green-700 border-green-200",
  INTERMEDIATE: "bg-amber-100 text-amber-700 border-amber-200",
  ADVANCED: "bg-rose-100 text-rose-700 border-rose-200",
};

export const GRAMMAR_LEVEL_DOT: Record<GrammarLevel, string> = {
  BEGINNER: "bg-green-500",
  INTERMEDIATE: "bg-amber-500",
  ADVANCED: "bg-rose-500",
};

/* ---------- تمرین نوشتاری ---------- */

export type WritingTopic = {
  id: string;
  titleEn: string;
  titleFa: string;
  prompt: string;
  promptFa: string;
  usefulWords: { en: string; fa: string }[];
  icon: string;
  order: number;
};

export type WritingCorrection = {
  type: "spelling" | "grammar";
  original: string;
  correction: string;
  note: string;
};

export type WritingFeedback = {
  onTopic: boolean;
  topicNote: string;
  overallScore: number;
  summary: string;
  wordCount: number;
  spellingErrors: WritingCorrection[];
  grammarErrors: WritingCorrection[];
  goodPoints: string[];
  suggestions: string[];
};

/* ---------- نمای کلی تمرین‌ها ---------- */

export type PracticeOverview = {
  listening: { total: number; completed: number };
  grammar: { total: number; completed: number };
  writing: { total: number; completed: number };
};
