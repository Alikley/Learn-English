export type LessonSectionType =
  | "INTRO"
  | "GRAMMAR"
  | "EXAMPLE"
  | "PRACTICE"
  | "QUIZ";

export type LessonSection = {
  id: string;
  type: LessonSectionType;
  title: string;
  content: string;
  image?: string | null;
  audio?: string | null;
  order: number;
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
  sections: LessonSection[];
};

export type LessonProgress = {
  lessonId: string;
  currentSectionIndex: number;
  isCompleted: boolean;
  score?: number;
};
