"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import LessonCard from "@/app/components/course/LessonCard";
import EmptyState from "@/app/components/course/EmptyState";
import { LEVEL_LABEL } from "@/types/course";
import { getCourseTheme } from "@/lib/course-theme";
import { useCourseDetail } from "@/app/hook/useCourseDetail";

// ========================================
// صفحه جزئیات دوره — v1.0.1.1
//
// طبق بازخورد کاربر:
//  - کارت‌های درس به طرح اصلی/قبلی برگشتند (بدون نردبان)
//  - تم رنگی پس‌زمینه که پسندید حفظ شد:
//     گرامر آبی / مکالمه سبز / لغات بنفش / لیسنینگ نارنجی
//    (تم از lib/course-theme.ts می‌آید و از titleEn دوره
//     تشخیص داده می‌شود — همان منطق API دسته‌بندی‌ها.)
//
// هدر سفیدِ نیمه‌شفاف روی گرادیان رنگی نشسته تا رنگ
// بخش در کل صفحه حس شود. بج سطح، نوار پیشرفت و
// آمار هم‌رنگ بخش شده‌اند.
// ========================================

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { course, loading, completing, completeLesson, stats } =
    useCourseDetail(courseId);

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

  // تم رنگی بر اساس بخش دوره (گرامر/مکالمه/لغات/لیسنینگ)
  const theme = getCourseTheme(course.titleEn);

  return (
    <div
      className={`relative w-full min-h-full overflow-hidden ${theme.pageBg}`}
      dir="rtl"
    >
      {/* ابرهای نرم — طبق عکس مرجع: دایره‌های سفید محو روی گرادیان بخش */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute top-24 -left-16 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute top-[42%] right-[12%] w-40 h-40 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute bottom-[18%] -left-10 w-72 h-72 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-20 right-[28%] w-80 h-80 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute top-[64%] left-[38%] w-24 h-24 rounded-full bg-white/20 blur-2xl" />
      </div>

      {/* هدر — سفید نیمه‌شفاف روی گرادیان رنگی بخش */}
      <div
        className={`relative z-10 border-b ${theme.headerBg} ${theme.headerBorder}`}
      >
        <div className="px-4 md:px-6 py-4">
          {/* v1.0.1.3 — مقصد قطعی به‌جای router.back() تا بعد از تکمیل درس،
              بازگشت دیگر وارد درسِ تمام‌شده نشود و همیشه لیست دوره‌ها بیاید */}
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm mb-4 transition-colors"
          >
            <ArrowRight size={16} />
            بازگشت به دوره‌ها
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${theme.badge}`}
                >
                  {theme.label}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/70 text-slate-500`}
                >
                  {LEVEL_LABEL[course.level] ?? course.level}
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

            {stats && (
              <div className="flex gap-6 shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.completedCount}/{course.lessons.length}
                  </div>
                  <div className="text-xs text-slate-400">درس تکمیل شده</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">
                    {stats.earnedXp}
                  </div>
                  <div className="text-xs text-slate-400">XP کسب شده</div>
                </div>
              </div>
            )}
          </div>

          {course.isEnrolled && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{course.progress}% تکمیل شده</span>
                <span>
                  {course.lessons.length - (stats?.completedCount ?? 0)} درس
                  باقیمانده
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/80 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${theme.progress}`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* لیست درس‌ها — طرح اصلی کارت‌ها (حفظ‌شده طبق بازخورد) */}
      <div className="relative z-10 px-4 md:px-6 py-6 pb-10">
        {course.lessons.length === 0 ? (
          <EmptyState type="lessons" />
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {course.lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                isEnrolled={course.isEnrolled}
                courseId={courseId}
                completing={completing}
                onComplete={completeLesson}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
