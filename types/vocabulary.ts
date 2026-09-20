// ========================================
// انواع لغت‌نامه (نسخه 1.0.1.7)
// جعبه‌های لغات + ترجمه کلمه — مشترک بین API، هوک‌ها و کامپوننت‌ها
// ========================================

/** حداکثر کلمه در هر جعبه */
export const VOCAB_BOX_WORD_LIMIT = 10;

/** نام جعبه‌های پیش‌فرض — در اولین درخواست هر کاربر ساخته می‌شوند (۲ جعبه خالی) */
export const DEFAULT_BOX_NAMES = [
  "جعبه ۱",
  "جعبه ۲",
] as const;

/** سقف نام جعبه */
export const VOCAB_BOX_NAME_MAX = 60;

/** الگوی کلمه انگلیسی قابل افزودن — حروف + آپاستروف + خط تیره */
export const VOCAB_WORD_PATTERN = /^[A-Za-z][A-Za-z'’-]{0,79}$/;

/** یک کلمه داخل جعبه */
export type VocabWordItem = {
  id: number;
  word: string;
  translation: string | null;
  addedAt: string;
};

/** یک جعبه لغات همراه کلمه‌هایش */
export type VocabBox = {
  id: number;
  name: string;
  wordCount: number;
  isFull: boolean;
  words: VocabWordItem[];
};

/** پاسخ ترجمه کلمه */
export type TranslateResult = {
  word: string;
  translation: string | null;
  /** local = لغت‌نامه محلی | ai = هوش مصنوعی | null = پیدا نشد */
  source: "local" | "ai" | null;
  /** پیام فارسی وقتی ترجمه‌ای نیست */
  message?: string;
};
