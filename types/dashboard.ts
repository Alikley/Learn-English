export type DailyActivity = { date: string; lessons: number; xp: number };

export type WeeklyStats = { week: string; lessons: number; xp: number };

export type CategoryStat = {
  name: string;
  completed: number;
  total: number;
  progress: number;
};

export type UserInfo = {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
};

export type EnrollmentInfo = {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    titleEn: string | null;
    level: string;
    imageUrl: string | null;
    color: string | null;
  };
};

export type DashboardData = {
  user: UserInfo | null;
  enrollments: EnrollmentInfo[];
  streak: { current: number; longest: number };
  stats: {
    totalLessonsThisMonth: number;
    totalXPThisMonth: number;
    avgLessonsPerDay: number;
    totalCourses: number;
    avgProgress: number;
    totalListeningXP: number; 
    completedListeningEpisodes: number;
  };
  dailyActivity: DailyActivity[];
  weeklyStats: WeeklyStats[];
  categories: CategoryStat[];
};
