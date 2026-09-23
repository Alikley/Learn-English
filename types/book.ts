export type Book = {
  id: number;
  title: string;
  titleFa: string;
  author: string;
  description: string;
  level: string;
  coverUrl: string;
  pdfPath: string;
  pages: number;
};

// v1.0.2.3 — گام ۳: سطح کتاب دوزبانه (fa/en)
export type LevelInfo = {
  fa: string;
  en: string;
  color: string;
};

export function getLevelInfo(level: string): LevelInfo {
  switch (level) {
    case "BEGINNER":
      return {
        fa: "مبتدی",
        en: "Beginner",
        color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      };
    case "INTERMEDIATE":
      return {
        fa: "متوسط",
        en: "Intermediate",
        color: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      };
    case "ADVANCED":
      return {
        fa: "پیشرفته",
        en: "Advanced",
        color: "bg-rose-500/15 text-rose-400 border-rose-500/25",
      };
    default:
      return {
        fa: level,
        en: level,
        color: "bg-gray-500/15 text-gray-400 border-gray-500/25",
      };
  }
}
