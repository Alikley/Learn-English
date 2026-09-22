"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import CourseCard from "@/app/components/course/CourseCard";
import EmptyState from "@/app/components/course/EmptyState";
import GirlCharacter from "@/app/components/courses/GirlCharacter";
import { TOPIC_GROUPS } from "@/types/course";
import { useCourses } from "../hook/useCourses";

// ========================================
// صفحه «دوره‌های من» — اصلاح چیدمان v1.0.1.3
//
// طبق بازخورد کاربر:
//  - کارت‌های دوره‌ها «همان حالت قبل»: کنار هم در
//    گرید چندستونه (تا ۴ ستون در نمایشگر عریض)
//  - صفحه همان ساختار اصلی: همان هدر و بخش‌بندی
//  - کاراکتر دخترِ کلاه‌دار «کوچک‌تر» و در «سمت چپِ
//    دوره‌ها» — نه اینکه دوره‌ها چپ و کاراکتر راست باشد
//  - دسکتاپ: لیست دوره‌ها ستون اصلی + نوار باریک
//    کاراکتر در سمت چپ (چسبان هنگام اسکرول)
//  - موبایل: اول لیست دوره‌ها، بعد کاراکتر کوچک
//
// نکته RTL: در flex-row راست‌به‌چپ، اولین فرزند در
// «راست» می‌نشیند؛ پس لیست اول (ستون اصلی) و کاراکتر
// دوم (سمت چپ) است — بدون هیچ کلاس ترتیب‌دهنده.
// ========================================

export default function MyCoursePage() {
  const { tr, dir } = useLanguage();
  const { courses, loading, enrolling, enroll } = useCourses();

  if (loading) return <PageLoading />;

  if (courses.length === 0) return <EmptyState />;

  return (
    <div className="w-full min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] pb-12" dir={dir}>
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-5">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {tr("دوره‌های من", "My Courses")}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {tr("مسیر یادگیری خود را انتخاب کن", "Choose your learning path")}
        </p>
      </div>

      <div className="px-4 md:px-6 pt-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
          {/* ===== لیست دوره‌ها — ستون اصلی؛ کارت‌ها کنار هم مثل قبل ===== */}
          <div className="flex-1 min-w-0 space-y-10">
            {TOPIC_GROUPS.map((group) => {
              const grouped = courses.filter((c) =>
                c.titleEn?.toLowerCase().includes(group.key.toLowerCase()),
              );
              if (grouped.length === 0) return null;

              return (
                <section key={group.key}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{group.icon}</span>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                      {tr(group.label, group.labelEn)}
                    </h2>
                    <span className="text-slate-400 text-sm">
                      ({grouped.length} {tr("دوره", "courses")})
                    </span>
                  </div>
                  {/* کارت‌ها کنار هم — همان حس صفحهٔ اصلی */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {grouped.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onEnroll={enroll}
                        enrolling={enrolling}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* ===== کاراکتر دختر — کوچک‌تر، سمت چپِ دوره‌ها ===== */}
          <aside className="w-40 lg:w-44 xl:w-48 shrink-0 mx-auto lg:mx-0 lg:sticky lg:top-6 flex flex-col items-center">
            <GirlCharacter />
            <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
              {tr("چشم‌هایم به موس توست — بیا یاد بگیریم!", "My eyes are on your mouse — let's learn!")}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
