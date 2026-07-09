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

export type LevelInfo = {
  fa: string;
  color: string;
};

export function getLevelInfo(level: string): LevelInfo {
  switch (level) {
    case "BEGINNER":
      return {
        fa: "مبتدی",
        color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      };
    case "INTERMEDIATE":
      return {
        fa: "متوسط",
        color: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      };
    case "ADVANCED":
      return {
        fa: "پیشرفته",
        color: "bg-rose-500/15 text-rose-400 border-rose-500/25",
      };
    default:
      return {
        fa: level,
        color: "bg-gray-500/15 text-gray-400 border-gray-500/25",
      };
  }
}
