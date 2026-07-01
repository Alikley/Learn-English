"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import LessonCard from "@/app/components/course/LessonCard";
import EmptyState from "@/app/components/course/EmptyState";
import { LEVEL_LABEL } from "@/types/course";
import { useCourseDetail } from "@/app/hook/useCourseDetail";

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

  return (
    <div className="w-full min-h-full bg-[#fbfbfb]" dir="rtl">
      {/* هدر */}
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
                  <div className="text-2xl font-bold text-yellow-500">
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
          <EmptyState type="lessons" />
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
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
