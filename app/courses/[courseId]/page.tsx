"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock,
  Star,
  ArrowRight,
  BookOpen,
  ChevronLeft,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  duration: number | null;
  xp: number;
  order: number;
  isCompleted: boolean;
  completedAt: string | null;
  score: number | null;
};

type CourseDetail = {
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

const levelLabel: Record<string, string> = {
  BEGINNER: "مبتدی",
  ELEMENTARY: "پایه",
  INTERMEDIATE: "متوسط",
  UPPER_INTERMEDIATE: "متوسط رو به بالا",
  ADVANCED: "پیشرفته",
};

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  const handleComplete = async (lessonId: string) => {
    if (!course?.isEnrolled) return;
    setCompleting(lessonId);
    await fetch(`/api/courses/${courseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, score: 100 }),
    });
    // رفرش
    const res = await fetch(`/api/courses/${courseId}`);
    const data = await res.json();
    setCourse(data);
    setCompleting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-3"
        dir="rtl"
      >
        <p className="text-slate-500">دوره یافت نشد</p>
        <button onClick={() => router.back()} className="text-blue-600 text-sm">
          بازگشت
        </button>
      </div>
    );
  }

  const completedCount = course.lessons.filter((l) => l.isCompleted).length;
  const totalXp = course.lessons.reduce((s, l) => s + l.xp, 0);
  const earnedXp = course.lessons
    .filter((l) => l.isCompleted)
    .reduce((s, l) => s + l.xp, 0);

  return (
    <div className="w-full min-h-full bg-[#fbfbfb]" dir="rtl">
      {/* هدر دوره */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-4 md:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 text-sm mb-4 transition-colors"
          >
            <ArrowRight size={16} />
            بازگشت به دوره‌ها
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {levelLabel[course.level] ?? course.level}
                </span>
                {course.titleEn && (
                  <span className="text-xs text-slate-400">
                    {course.titleEn}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-slate-500 text-sm mt-1">
                  {course.description}
                </p>
              )}
            </div>

            {/* آمار */}
            <div className="flex gap-4 md:gap-6 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {completedCount}/{course.lessons.length}
                </div>
                <div className="text-xs text-slate-400">درس تکمیل شده</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {earnedXp}
                </div>
                <div className="text-xs text-slate-400">XP کسب شده</div>
              </div>
            </div>
          </div>

          {/* نوار پیشرفت */}
          {course.isEnrolled && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{course.progress}% تکمیل شده</span>
                <span>
                  {course.lessons.length - completedCount} درس باقیمانده
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${course.color ?? "bg-blue-500"}`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* لیست درس‌ها */}
      <div className="px-4 md:px-6 py-6">
        {course.lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <BookOpen size={48} className="text-slate-200" />
            <p className="text-slate-400">هنوز درسی اضافه نشده</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {course.lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                isEnrolled={course.isEnrolled}
                completing={completing}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  index,
  isEnrolled,
  completing,
  onComplete,
}: {
  lesson: Lesson;
  index: number;
  isEnrolled: boolean;
  completing: string | null;
  onComplete: (id: string) => void;
}) {
  const isCompleting = completing === lesson.id;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 ${
        lesson.isCompleted
          ? "border-green-200 shadow-[0_2px_12px_rgba(34,197,94,0.08)]"
          : "border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] hover:border-blue-200"
      }`}
    >
      <div className="p-4 flex items-center gap-4">
        {/* شماره / وضعیت */}
        <div className="shrink-0">
          {lesson.isCompleted ? (
            <CheckCircle2 size={28} className="text-green-500" />
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-400">
                {index + 1}
              </span>
            </div>
          )}
        </div>

        {/* محتوا */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm md:text-base leading-tight ${lesson.isCompleted ? "text-green-700" : "text-slate-800"}`}
          >
            {lesson.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            {lesson.duration && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                {lesson.duration} دقیقه
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
              <Star size={12} />
              {lesson.xp} XP
            </span>
            {lesson.score !== null && (
              <span className="text-xs text-green-600 font-medium">
                امتیاز: {lesson.score}
              </span>
            )}
          </div>
        </div>

        {/* دکمه */}
        {isEnrolled && (
          <div className="shrink-0">
            {lesson.isCompleted ? (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                تکمیل ✓
              </span>
            ) : (
              <button
                onClick={() => onComplete(lesson.id)}
                disabled={isCompleting}
                className="flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {isCompleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ChevronLeft size={14} />
                    شروع
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {!isEnrolled && (
          <Circle size={20} className="text-slate-200 shrink-0" />
        )}
      </div>
    </div>
  );
}
