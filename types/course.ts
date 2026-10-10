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

// v1.0.4.4 — نسخهٔ تیرهٔ بج‌ها اضافه شد (کارت دورهٔ بازطراحی‌شده)
export const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  ELEMENTARY: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  UPPER_INTERMEDIATE: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  ADVANCED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export const TOPIC_GROUPS = [
  { key: "Grammar", label: "گرامر", labelEn: "Grammar", icon: "📝" },
  { key: "Conversation", label: "مکالمه", labelEn: "Conversation", icon: "💬" },
  { key: "Vocabulary", label: "لغات", labelEn: "Vocabulary", icon: "📚" },
  { key: "Listening", label: "لیسنینگ", labelEn: "Listening", icon: "🎧" },
];
