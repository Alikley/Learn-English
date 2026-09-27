"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, ChevronLeft, BookMarked, Clock3 } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحهٔ اصلی آیلتس (v1.0.3.2 — گام ۲)
// دو باکس بزرگ: آیلتس آکادمیک (فعال — ورودی کمبریج) و آیلتس جنرال (به‌زودی)
// دارک‌مود + دوزبانه (فا/EN) + جهت‌دهی خودکار
// ========================================

export default function IeltsHubPage() {
  const { tr, dir } = useLanguage();

  return (
    <div
      className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors"
      dir={dir}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* ================= هدر ================= */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            <GraduationCap size={15} className="text-indigo-600 dark:text-indigo-300" />
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
              {tr("بخش تخصصی آزمون", "Exam preparation")}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-slate-100">
            {tr("آزمون آیلتس", "IELTS")}
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {tr(
              "مسیر آمادگی آیلتس شما از اینجا شروع می‌شود — آزمون‌های شبیه‌ساز با تایمر، تصحیح خودکار و نمرهٔ بند.",
              "Your IELTS journey starts here — mock exams with timers, auto-scoring and band results.",
            )}
          </p>
        </motion.div>

        {/* ================= دو باکس آکادمیک / جنرال ================= */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* ---------- آیلتس آکادمیک (فعال) ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-500/25 shadow-[0_8px_30px_rgba(79,70,229,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            {/* سربرگ گرادیانی */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-5 text-white space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                  <GraduationCap size={22} />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/25 text-emerald-100 border border-emerald-300/30">
                  {tr("فعال", "Active")}
                </span>
              </div>
              <h2 className="text-lg font-bold">{tr("آیلتس آکادمیک", "IELTS Academic")}</h2>
              <p className="text-[11px] leading-relaxed text-white/80">
                {tr(
                  "برای پذیرش دانشگاه و مهاجرت تحصیلی — ریدینگ، لیسنینگ و رایتینگ آکادمیک.",
                  "For university admission and study migration — Academic Reading, Listening and Writing.",
                )}
              </p>
            </div>

            {/* داخل باکس: ورودی کمبریج (گام ۳) */}
            <div className="p-5 space-y-3">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                {tr("منابع موجود", "Available resources")}
              </p>

              {/* باکس کمبریج */}
              <Link
                href="/ielts/cambridge"
                className="group flex items-center gap-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                  <BookMarked size={20} className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0 text-start">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {tr("کمبریج", "Cambridge")}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tr("کتاب‌های ۱ تا ۸ — تست کامل آکادمیک", "Books 1 to 8 — full Academic tests")}
                  </p>
                </div>
                <ChevronLeft
                  size={18}
                  className="text-indigo-400 group-hover:-translate-x-1 transition-transform rtl:rotate-180"
                />
              </Link>

              {/* آمار سریع */}
              <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <BookMarked size={12} />
                  {tr("۸ کتاب", "8 books")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 size={12} />
                  {tr("۱۲۰ سوال در هر تست", "120 questions per test")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ---------- آیلتس جنرال (به‌زودی) ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden opacity-90"
          >
            <div className="bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-700 dark:to-slate-800 p-5 text-white space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Briefcase size={22} />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-400/25 text-amber-100 border border-amber-300/30">
                  {tr("به‌زودی", "Coming soon")}
                </span>
              </div>
              <h2 className="text-lg font-bold">{tr("آیلتس جنرال", "IELTS General")}</h2>
              <p className="text-[11px] leading-relaxed text-white/80">
                {tr(
                  "برای ویزای کاری و مهاجرت — ریدینگ و رایتینگ جنرال با نامه‌نگاری رسمی.",
                  "For work visas and migration — General Reading and Writing with formal letters.",
                )}
              </p>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center space-y-2">
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  {tr(
                    "آزمون‌های آیلتس جنرال در نسخه‌های بعدی اضافه می‌شوند. فعلاً روی مسیر آکادمیک تمرین کنید!",
                    "General Training tests arrive in upcoming versions. Train on the Academic track for now!",
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ================= راهنمای مسیر ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5"
        >
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
            {tr("چطور شروع کنم؟", "How do I start?")}
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                n: 1,
                fa: "از باکس آکادمیک، کمبریج را باز کنید و کتاب ۱ را انتخاب کنید.",
                en: "From the Academic box, open Cambridge and pick Book 1.",
              },
              {
                n: 2,
                fa: "مهارت و حالت را انتخاب کنید: تمرین (با پاسخ و تحلیل) یا آزمون (با تایمر واقعی).",
                en: "Pick a skill and mode: practice (with answers) or exam (with a real timer).",
              },
              {
                n: 3,
                fa: "آزمون را تحویل دهید تا نمرهٔ بند و تحلیل سوال به سوال را ببینید.",
                en: "Submit to see your band score and the question-by-question review.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3.5 flex gap-3"
              >
                <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {s.n}
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tr(s.fa, s.en)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
