// ========================================
// انواع و تنظیمات مربوط به بازی‌ها (فقط صفحه بازی‌ها)
// ========================================

// ---- سطح difficulty بازی هنگ‌من ----
export type GameLevel = "EASY" | "MEDIUM" | "HARD";

// ---- سطح CEFR کلمه (استاندارد اروپایی) ----
// سطح‌بندی کلمات بر اساس سخت‌گیری واژگانی است، نه تعداد/طول کلمه:
//   EASY   = A1        (پایه)
//   MEDIUM = A2 - B1   (متوسط)
//   HARD   = B2 - C1   (پیشرفته)
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

// نگاشت سطح CEFR → سطح بازی
export const CEFR_TO_LEVEL: Record<CefrLevel, GameLevel> = {
  A1: "EASY",
  A2: "MEDIUM",
  B1: "MEDIUM",
  B2: "HARD",
  C1: "HARD",
};

export type HangmanWord = {
  id: number;
  word: string;
  hint: string;
  category: string;
  level: GameLevel;
  // سطح CEFR کلمه (A1..C1) — از API برمی‌گردد
  cefr?: CefrLevel;
};

export type GameStats = {
  bestScore: number;
  totalWins: number;
  totalLosses: number;
  sessionsPlayed: number;
};

export type StreakInfo = {
  current: number;
  longest: number;
};

// ---- قوانین امتیازدهی و دور بازی ----
export const GAME_CONFIG = {
  wordsPerSession: 10,
  maxWrong: 6,
  pointsPerLetter: 10,
  winBaseBonus: 40,
  pointsPerLife: 10,
} as const;

// ---- تایمر حدس حرف هنگ‌من (v1.0.0.6 — گام ۲) ----
// زمان هر حدس بر اساس سطح: آسان ۵ / متوسط ۷ / سخت ۱۰ ثانیه.
// اگر کاربر در این بازه حرفی حدس نزند، یک تکه از هنگ‌من تکمیل می‌شود
// و تایمر دوباره از ابتدا شروع می‌شود؛ با تکمیل همه تکه‌ها بازی آن کلمه باخت است.
export const HANGMAN_TIMER_SECONDS: Record<GameLevel, number> = {
  EASY: 5,
  MEDIUM: 7,
  HARD: 10,
} as const;

// ---- تنظیمات هر سطح ----
// سطح‌بندی بر اساس CEFR: آسان=A1 / متوسط=A2-B1 / سخت=B2-C1
export type GameLevelConfig = {
  id: GameLevel;
  fa: string;
  desc: string;
  cefrLabel: string;
  badge: string;
  theme: string;
};

export const GAME_LEVELS: GameLevelConfig[] = [
  {
    id: "EASY",
    fa: "آسان",
    desc: "کلمات پایه سطح A1 — برای شروع و یادگیری اصولی",
    cefrLabel: "A1",
    badge: "bg-emerald-100 text-emerald-700",
    theme: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/60",
  },
  {
    id: "MEDIUM",
    fa: "متوسط",
    desc: "کلمات سطح A2 تا B1 — چالش واقعی برای تقویت واژگان",
    cefrLabel: "A2 - B1",
    badge: "bg-orange-100 text-orange-700",
    theme: "border-orange-200 hover:border-orange-400 bg-orange-50/60",
  },
  {
    id: "HARD",
    fa: "سخت",
    desc: "کلمات پیشرفته سطح B2 و C1 — مخصوص حرفه‌ای‌ها",
    cefrLabel: "B2 - C1",
    badge: "bg-red-100 text-red-700",
    theme: "border-red-200 hover:border-red-400 bg-red-50/60",
  },
];

// بج سطح کلمه (برای نمایش کنار راهنما)
export function getGameLevel(level: string): { fa: string; color: string } {
  const config = GAME_LEVELS.find((l) => l.id === level);
  if (config) return { fa: config.fa, color: config.badge };
  return { fa: "آسان", color: "bg-emerald-100 text-emerald-700" };
}

// برچسب فارسی دسته‌بندی کلمات هنگ‌من
export const CATEGORY_LABELS: Record<string, string> = {
  animals: "حیوانات",
  food: "خوراکی‌ها",
  colors: "رنگ‌ها",
  family: "خانواده",
  school: "مدرسه",
  nature: "طبیعت",
  body: "بدن",
  travel: "سفر",
  time: "زمان",
  jobs: "شغل‌ها",
  tech: "تکنولوژی",
  house: "خانه",
  clothes: "لباس",
  weather: "آب و هوا",
  celebration: "جشن‌ها",
  general: "عمومی",
  // ---- افزودنی‌های v1.0.0.6 (دسته‌بندی واژه‌های سطح بالا) ----
  health: "سلامت",
  character: "شخصیت",
  academic: "آکادمیک",
  work: "کار",
  feelings: "احساسات",
  environment: "محیط زیست",
};

// ========================================
// بازی حافظه کلمات (Memory Match)
// ========================================

// ---- جفت کلمه انگلیسی + معنی فارسی ----
export type MemoryWordPair = {
  id: number;
  word: string;
  translation: string;
  category: string;
  level: GameLevel;
  // سطح CEFR کلمه (A1..C1) — از API برمی‌گردد
  cefr?: CefrLevel;
};

// ---- قوانین امتیازدهی و ساختار بازی حافظه ----
export const MEMORY_CONFIG = {
  // هر دور کامل = ۳ تخته (راند) پشت سر هم
  roundsPerSession: 3,
  // تعداد جفت روی هر تخته — در همه سطح‌ها یکسان است؛
  // سختی سطح فقط از سختی کلمات (CEFR) می‌آید نه تعداد کلمه
  pairsPerBoard: { EASY: 4, MEDIUM: 4, HARD: 4 } as Record<GameLevel, number>,
  // جان‌های پویا (v1.0.0.7 — گام ۱):
  // شروع دور با ۳ جان؛ هر جفت درست +۱ جان (تا سقف ۵)،
  // هر اشتباه −۱ جان؛ اگر جان‌ها به صفر برسد Game Over می‌شود.
  startLives: 3,
  maxLives: 5,
  // امتیاز هر جفت درست
  pointsPerMatch: 20,
  // پاداش کمبو: هر جفت پشت سر هم بدون خطا +۵ امتیاز بیشتر
  comboStepBonus: 5,
  // پاداش راند بی‌نقص (بدون هیچ اشتباهی)
  perfectRoundBonus: 50,
  // زمان برگشت کارت‌های ناهمسان (میلی‌ثانیه)
  flipBackDelayMs: 900,
} as const;

// ---- تنظیمات هر سطح برای بازی حافظه (سطح‌بندی CEFR) ----
export const MEMORY_LEVELS: GameLevelConfig[] = [
  {
    id: "EASY",
    fa: "آسان",
    desc: "کلمات پایه سطح A1 — شروع ملایم برای گرم کردن حافظه (۴ جفت در هر راند)",
    cefrLabel: "A1",
    badge: "bg-emerald-100 text-emerald-700",
    theme: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/60",
  },
  {
    id: "MEDIUM",
    fa: "متوسط",
    desc: "کلمات سطح A2 تا B1 — چالش واقعی برای تقویت واژگان (۴ جفت در هر راند)",
    cefrLabel: "A2 - B1",
    badge: "bg-orange-100 text-orange-700",
    theme: "border-orange-200 hover:border-orange-400 bg-orange-50/60",
  },
  {
    id: "HARD",
    fa: "سخت",
    desc: "کلمات پیشرفته سطح B2 و C1 — بزرگ‌ترین چالش واژگان (۴ جفت در هر راند)",
    cefrLabel: "B2 - C1",
    badge: "bg-red-100 text-red-700",
    theme: "border-red-200 hover:border-red-400 bg-red-50/60",
  },
];

// تعداد کل کلمات لازم برای یک دور کامل (بر اساس سطح)
export function memoryWordCount(level: GameLevel): number {
  return MEMORY_CONFIG.roundsPerSession * MEMORY_CONFIG.pairsPerBoard[level];
}

// ========================================
// بازی کوییز سرعتی (Speed Quiz)
// ========================================

// ---- نوع سوال: کلمه (معنی فارسی) یا جمله (جاگذاری) ----
export type SpeedQuizQuestionType = "WORD" | "SENTENCE";

// ---- یک سوال کامل آمادهٔ نمایش ----
export type SpeedQuizQuestion = {
  id: number;
  type: SpeedQuizQuestionType;
  // کلمه انگلیسی (WORD) یا جمله با جای خالی ___ (SENTENCE)
  prompt: string;
  // ۴ گزینه شافل‌شده — یکی درست
  options: string[];
  // اندیس گزینه درست در options
  correctIndex: number;
  // معنی فارسی (راهنمای بعد از پاسخ)
  translation: string;
  category: string;
  level: GameLevel;
  // سطح CEFR سوال — از API برمی‌گردد
  cefr?: CefrLevel;
};

// ---- قوانین امتیازدهی و دور کوییز سرعتی ----
// سرعت پاسخ = امتیاز بیشتر؛ سختی سطح فقط از سختی کلمات (CEFR) می‌آید،
// نه تعداد سوال و نه زمان بیشتر — زمان برای همه سطح‌ها یکسان است.
export const SPEEDQUIZ_CONFIG = {
  // تعداد سوال هر دور
  questionsPerSession: 10,
  // زمان هر سوال (ثانیه) — در همه سطح‌ها یکسان
  secondsPerQuestion: 12,
  // جان‌های بازی — با هر پاسخ غلط/تایم‌اوت یکی کم می‌شود
  lives: 3,
  // امتیاز پایه هر پاسخ درست
  basePoints: 10,
  // پاداش سرعت: هر ثانیه باقی‌مانده × ۲ امتیاز
  timeBonusPerSecond: 2,
  // پاداش کمبو: هر پاسخ درست پشت سر هم +۵ امتیاز بیشتر
  comboStepBonus: 5,
  // پاداش دور بی‌نقص (همه درست + جان کامل)
  perfectSessionBonus: 50,
  // زمان نمایش نتیجه هر سوال (میلی‌ثانیه)
  feedbackMs: 1500,
} as const;

// ---- تنظیمات هر سطح برای کوییز سرعتی (سطح‌بندی CEFR) ----
export const SPEEDQUIZ_LEVELS: GameLevelConfig[] = [
  {
    id: "EASY",
    fa: "آسان",
    desc: "کلمات و جملات پایه سطح A1 — گرم‌کردن مغزه با سرعت زیاد",
    cefrLabel: "A1",
    badge: "bg-emerald-100 text-emerald-700",
    theme: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/60",
  },
  {
    id: "MEDIUM",
    fa: "متوسط",
    desc: "کلمات و جملات سطح A2 تا B1 — چالش واقعی واژگان و گرامر",
    cefrLabel: "A2 - B1",
    badge: "bg-orange-100 text-orange-700",
    theme: "border-orange-200 hover:border-orange-400 bg-orange-50/60",
  },
  {
    id: "HARD",
    fa: "سخت",
    desc: "کلمات و جملات پیشرفته B2 و C1 — سرعت + دانش = قهرمانی",
    cefrLabel: "B2 - C1",
    badge: "bg-red-100 text-red-700",
    theme: "border-red-200 hover:border-red-400 bg-red-50/60",
  },
];
