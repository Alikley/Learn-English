"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import CourseCard from "@/app/components/course/CourseCard";
import EmptyState from "@/app/components/course/EmptyState";
import GirlCharacter from "@/app/components/course/GirlCharacter";
import { TOPIC_GROUPS } from "@/types/course";
import { useCourses } from "../hook/course/useCourses";
import { BookOpen, Sparkles, TrendingUp, GraduationCap } from "lucide-react";

// ========================================
// صفحه «دوره‌های من» — بازطراحی v1.0.4.4 (English 1.0.0.8)
//
// 🎨 بازخورد کاربر: «گریدبندی کارت‌ها و کاراکتر بدر نمیخوره —
//    دیزاین کارت‌ها خوب نیست، واضح بشه»
//
// چیدمان جدید:
//  ۱) بنر خوش‌آمد — کاراکتر دختر داخل خودِ بنر (سمت پایانِ جهت؛
//     در فارسی چپ) + آمار سریع (کل دوره‌ها / ثبت‌نام‌شده / پیشرفت)
//     — دیگر ستون باریکِ چسبان کنار گرید نیست
//  ۲) گرید تمام‌عرض — بدون رزرو فضای کاراکتر:
//     sm:2 → lg:3 → xl:4 ستون؛ کارت‌ها نفس بیشتری دارند
//  ۳) کارت دوره — بازطراحی‌شده در CourseCard.tsx (سلسله‌مراتب واضح)
// ========================================

export default function MyCoursePage() {
  const { tr, dir } = useLanguage();
  const { courses, loading, enrolling, enroll } = useCourses();

  if (loading) return <PageLoading />;

  if (courses.length === 0) return <EmptyState />;

  // آمار سریع برای بنر
  const enrolledList = courses.filter((c) => c.isEnrolled);
  const avgProgress =
    enrolledList.length > 0
      ? Math.round(enrolledList.reduce((s, c) => s + c.progress, 0) / enrolledList.length)
      : 0;

  const stats = [
    {
      icon: BookOpen,
      value: String(courses.length),
      label: tr("دورهٔ فعال", "courses"),
      color: "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300",
    },
    {
      icon: GraduationCap,
      value: String(enrolledList.length),
      label: tr("ثبت‌نام‌شده", "enrolled"),
      color: "bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-300",
    },
    {
      icon: TrendingUp,
      value: `${avgProgress}%`,
      label: tr("میانگین پیشرفت", "avg progress"),
      color: "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300",
    },
  ];

  return (
    <div className="w-full min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] pb-12" dir={dir}>
      {/* ================= هدر ================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-5">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">
          {tr("دوره‌های من", "My Courses")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {tr("مسیر یادگیری خود را انتخاب کن", "Choose your learning path")}
        </p>
      </div>

      <div className="px-4 md:px-6 pt-6 space-y-8">
        {/* ================= بنر خوش‌آمد + کاراکتر ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-teal-50 via-emerald-50/70 to-blue-50 dark:from-slate-800 dark:via-slate-800/60 dark:to-slate-900 border border-teal-100/60 dark:border-slate-700/60">
          {/* شکل تزئینی */}
          <div className="absolute -top-12 -start-12 w-40 h-40 rounded-full bg-teal-100/40 dark:bg-teal-500/5" />
          <div className="absolute -bottom-14 -end-10 w-44 h-44 rounded-full bg-blue-100/40 dark:bg-blue-500/5" />

          <div className="relative z-10 flex items-center gap-4 md:gap-8 p-5 md:p-6">
            {/* متن و آمار — سمت شروع (راست در فارسی) */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="space-y-1.5">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-300">
                  <Sparkles size={13} />
                  {tr("راهنمای یادگیری", "Learning guide")}
                </p>
                <h2 className="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-snug">
                  {tr("امروز چیز جدید یاد بگیریم!", "Let's learn something new today!")}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tr(
                    "دوره‌ات را از پایین انتخاب کن — چشم‌هایم به موس توست و همراهتم!",
                    "Pick your course below — my eyes follow your mouse!",
                  )}
                </p>
              </div>

              {/* آمار سریع */}
              <div className="flex flex-wrap gap-2.5">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 ${s.color}`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <div className="leading-none">
                        <div className="text-base font-black tabular-nums" dir="ltr">
                          {s.value}
                        </div>
                        <div className="text-[10px] font-medium opacity-80 mt-1">{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* کاراکتر — سمت پایانِ جهت (چپ در فارسی) و کاملاً داخل بنر */}
            <div className="shrink-0 w-28 sm:w-36 lg:w-44 self-stretch flex items-end justify-center">
              <div className="w-full">
                <GirlCharacter />
              </div>
            </div>
          </div>
        </div>

        {/* ================= گروه‌های دوره — گرید تمام‌عرض ================= */}
        {TOPIC_GROUPS.map((group) => {
          const grouped = courses.filter((c) =>
            c.titleEn?.toLowerCase().includes(group.key.toLowerCase()),
          );
          if (grouped.length === 0) return null;

          return (
            <section key={group.key}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100">
                  {tr(group.label, group.labelEn)}
                </h2>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                  ({grouped.length} {tr("دوره", "courses")})
                </span>
              </div>
              {/* گرید تمام‌عرض — بدون رزرو فضای کاراکتر */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
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
    </div>
  );
}
