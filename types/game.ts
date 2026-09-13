// ========================================
// انواع و تنظیمات مربوط به بازی‌ها (فقط صفحه بازی‌ها)
// ========================================

// ---- سطح difficulty بازی هنگ‌من ----
export type GameLevel = "EASY" | "MEDIUM" | "HARD";

export type HangmanWord = {
  id: number;
  word: string;
  hint: string;
  category: string;
  level: GameLevel;
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

// ---- تنظیمات هر سطح ----
export type GameLevelConfig = {
  id: GameLevel;
  fa: string;
  desc: string;
  lengthLabel: string;
  badge: string;
  theme: string;
};

export const GAME_LEVELS: GameLevelConfig[] = [
  {
    id: "EASY",
    fa: "آسان",
    desc: "کلمات کوتاه و پرکاربرد — برای گرم کردن و یادگیری پایه",
    lengthLabel: "۳ تا ۵ حرف",
    badge: "bg-emerald-100 text-emerald-700",
    theme: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/60",
  },
  {
    id: "MEDIUM",
    fa: "متوسط",
    desc: "کلمات متوسط — چالش واقعی برای تقویت واژگان",
    lengthLabel: "۶ تا ۸ حرف",
    badge: "bg-orange-100 text-orange-700",
    theme: "border-orange-200 hover:border-orange-400 bg-orange-50/60",
  },
  {
    id: "HARD",
    fa: "سخت",
    desc: "کلمات بلند و پیشرفته — مخصوص حرفه‌ای‌ها",
    lengthLabel: "۹ حرف و بیشتر",
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
};
