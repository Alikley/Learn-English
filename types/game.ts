// ========================================
// انواع مربوط به بازی‌ها (فقط صفحه بازی‌ها)
// ========================================

export type HangmanWord = {
  id: number;
  word: string;
  hint: string;
  category: string;
  level: string;
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
};

// سطح کلمه → برچسب فارسی + رنگ بج
export function getGameLevel(level: string): {
  fa: string;
  color: string;
} {
  switch (level) {
    case "INTERMEDIATE":
      return { fa: "متوسط", color: "bg-orange-100 text-orange-700" };
    case "ELEMENTARY":
      return { fa: "پایه", color: "bg-amber-100 text-amber-700" };
    default:
      return { fa: "مبتدی", color: "bg-green-100 text-green-700" };
  }
}
