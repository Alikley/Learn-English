export type Course = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  level: string;
  imageUrl: string | null;
  color: string | null;
  totalLessons: number;
  isEnrolled: boolean;
  progress: number;
  enrolledAt: string | null;
};

export type Lesson = {
  id: string;
  title: string;
  duration: number | null;
  xp: number;
  order: number;
  isCompleted: boolean;
  completedAt: string | null;
  score: number | null;
};

export type CourseDetail = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  level: string;
  imageUrl: string | null;
  color: string | null;
  isEnrolled: boolean;
  progress: number;
  lessons: Lesson[];
};

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "مبتدی",
  ELEMENTARY: "پایه",
  INTERMEDIATE: "متوسط",
  UPPER_INTERMEDIATE: "متوسط رو به بالا",
  ADVANCED: "پیشرفته",
};

export const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  ELEMENTARY: "bg-blue-100 text-blue-700",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700",
  UPPER_INTERMEDIATE: "bg-orange-100 text-orange-700",
  ADVANCED: "bg-red-100 text-red-700",
};

export const TOPIC_GROUPS = [
  { key: "Grammar", label: "گرامر", icon: "📝" },
  { key: "Conversation", label: "مکالمه", icon: "💬" },
  { key: "Vocabulary", label: "لغات", icon: "📚" },
  { key: "Listening", label: "لیسنینگ", icon: "🎧" },
];
