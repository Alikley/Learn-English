export type ListeningGap = {
  id: number;
  answer: string;
  hint: string;
};

export type ListeningEpisode = {
  id: string;
  title: string;
  titleFa: string;
  description: string;
  audioUrl: string;
  level: string;
  duration: number;
  xp: number;
  order: number;
  transcript: string;
  gaps: ListeningGap[];
  progress: {
    stars: number;
    score: number;
    xpEarned: number;
    completedAt: string | null;
  } | null;
};

export type LevelInfo = { fa: string; color: string };

export function getListeningLevel(level: string): LevelInfo {
  switch (level) {
    case "BEGINNER":
      return { fa: "مبتدی", color: "bg-green-100 text-green-700" };
    case "ELEMENTARY":
      return { fa: "پایه", color: "bg-blue-100 text-blue-700" };
    case "INTERMEDIATE":
      return { fa: "متوسط", color: "bg-orange-100 text-orange-700" };
    default:
      return { fa: "پیشرفته", color: "bg-purple-100 text-purple-700" };
  }
}
