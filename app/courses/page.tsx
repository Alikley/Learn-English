"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Lock, ChevronLeft } from "lucide-react";

type Course = {
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
};

const levelLabel: Record<string, string> = {
  BEGINNER: "مبتدی",
  ELEMENTARY: "پایه",
  INTERMEDIATE: "متوسط",
  UPPER_INTERMEDIATE: "متوسط رو به بالا",
  ADVANCED: "پیشرفته",
};

const levelColor: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  ELEMENTARY: "bg-blue-100 text-blue-700",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700",
  UPPER_INTERMEDIATE: "bg-orange-100 text-orange-700",
  ADVANCED: "bg-red-100 text-red-700",
};

// گروه‌بندی موضوعی دوره‌ها بر اساس titleEn
const topicGroups = [
  { key: "Grammar", label: "گرامر", icon: "📝" },
  { key: "Conversation", label: "مکالمه", icon: "💬" },
  { key: "Vocabulary", label: "لغات", icon: "📚" },
  { key: "Listening", label: "لیسنینگ", icon: "🎧" },
];

export default function MyCoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    await fetch(`/api/courses/${courseId}`, { method: "PATCH" });
    // رفرش لیست
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data);
    setEnrolling(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // اگه دیتابیس خالیه fallback نشون بده
  if (courses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full min-h-full bg-[#fbfbfb] pb-12" dir="rtl">
      {/* هدر */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-5">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          دوره‌های من
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          مسیر یادگیری خود را انتخاب کن
        </p>
      </div>

      <div className="px-4 md:px-6 pt-6 space-y-10">
        {topicGroups.map((group) => {
          const groupCourses = courses.filter((c) =>
            c.titleEn?.toLowerCase().includes(group.key.toLowerCase()),
          );
          if (groupCourses.length === 0) return null;

          return (
            <section key={group.key}>
              {/* عنوان گروه */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  {group.label}
                </h2>
                <span className="text-slate-400 text-sm">
                  ({groupCourses.length} دوره)
                </span>
              </div>

              {/* گرید دوره‌ها */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    enrolling={enrolling}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CourseCard({
  course,
  onEnroll,
  enrolling,
}: {
  course: Course;
  onEnroll: (id: string) => void;
  enrolling: string | null;
}) {
  const isEnrolling = enrolling === course.id;
  const progressColor = course.color ?? "bg-blue-500";

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(15,23,42,0.06)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition-all duration-300 flex flex-col">
      {/* تصویر */}
      <div className="relative aspect-[16/7] overflow-hidden bg-slate-100">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-slate-300" />
          </div>
        )}
        {/* badge سطح */}
        <span
          className={`absolute top-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${levelColor[course.level] ?? "bg-slate-100 text-slate-600"}`}
        >
          {levelLabel[course.level] ?? course.level}
        </span>
      </div>

      {/* محتوا */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="text-xs text-slate-400 mb-3">
          {course.totalLessons} درس
        </div>

        {/* پیشرفت */}
        {course.isEnrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{course.progress}%</span>
              <span>پیشرفت</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${progressColor}`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* دکمه */}
        <div className="mt-auto">
          {course.isEnrolled ? (
            <Link
              href={`/my-course/${course.id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              <ChevronLeft size={16} />
              ادامه دوره
            </Link>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              disabled={isEnrolling}
              className="w-full flex items-center justify-center gap-1.5 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60"
            >
              {isEnrolling ? (
                <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <>
                  <BookOpen size={15} />
                  ثبت‌نام
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4"
      dir="rtl"
    >
      <Lock size={48} className="text-slate-300" />
      <h2 className="text-xl font-bold text-slate-700">
        هنوز دوره‌ای اضافه نشده
      </h2>
      <p className="text-slate-400 text-sm max-w-xs">
        برای اضافه کردن دوره، از پنل ادمین اقدام کنید یا دیتابیس را seed کنید.
      </p>
    </div>
  );
}
