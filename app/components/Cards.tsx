"use client";
import PageLoading from "@/app/components/PageLoading";

import { ArrowLeft, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useCategories } from "../hook/library/useCategories";
import { useLanguage } from "@/app/context/LanguageContext";

const exercises = [
  {
    title: "Match Card",
    titleFa: "Match Card",
    description: "کارت‌ها را باز کن و جفت کلمات را پیدا کن",
    descriptionEn: "Flip the cards and match the word pairs",
    bgColor: "bg-purple-50",
    btnColor: "bg-purple-200 text-purple-700",
    icon: "/assets/icon_1_abc_blocks.svg",
    btnLabel: "شروع بازی",
    btnLabelEn: "Play Now",
    href: "/game/memory",
  },
  {
    title: "Hangman",
    titleFa: "Hangman",
    description: "کلمات را حدس بزن و امتیاز بگیر",
    descriptionEn: "Guess the words and score points",
    bgColor: "bg-green-50",
    btnColor: "bg-green-200 text-green-700",
    icon: "/assets/icon_2_hangman.svg",
    btnLabel: "شروع بازی",
    btnLabelEn: "Play Now",
    href: "/game/hangman",
  },
  {
    title: "Quiz Hot",
    titleFa: "Quiz Hot",
    description: "سریع به سوال‌های کلمه و جمله جواب بده",
    descriptionEn: "Answer word and sentence questions fast",
    bgColor: "bg-amber-50",
    btnColor: "bg-amber-200 text-amber-700",
    icon: "/assets/icon_3_document_sign.svg",
    btnLabel: "شروع بازی",
    btnLabelEn: "Play Now",
    href: "/game/speedquiz",
  },
  {
    title: "تمرین شنیداری",
    titleFa: "تمرین شنیداری",
    titleEn: "Listening Practice",
    description: "به آهنگ‌ها و مکالمات گوش بده",
    descriptionEn: "Listen to songs and conversations",
    bgColor: "bg-blue-50",
    btnColor: "bg-blue-200 text-blue-700",
    icon: "/assets/icon_4_headphones.svg",
    btnLabel: "شروع تمرین",
    btnLabelEn: "Start Practice",
    href: "/training",
  },
];

export default function Cards() {
  const { categories, loading } = useCategories();
  const { tr } = useLanguage();

  return (
    <div>
      {/* ================= COURSES ================= */}
      <section className="mx-4 md:mx-5 pt-4 md:pt-8 pb-6 md:pb-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/courses"
            className="flex items-center gap-1 text-blue-600 text-xs md:text-sm font-medium"
          >
            <ArrowLeft size={14} />
            {tr("مشاهده همه", "View All")}
          </Link>
          <h2 className="text-[22px] md:text-[32px] font-bold text-slate-900">
            {tr("دوره‌های من", "My Courses")}
          </h2>
        </div>

        {loading ? (
          <PageLoading minHeightClass="py-16" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
            {categories.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              >
                <Link
                  href="/courses"
                  className="group overflow-hidden rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 shadow-[0_4px_18px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] block"
                >
                  <div className="relative aspect-[2.37/1] overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3 md:p-5">
                    <div className="text-start">
                      <h3 className="text-[16px] md:text-[20px] font-bold text-slate-900 dark:text-slate-100">
                        {card.title}
                      </h3>
                    </div>

                    {/* میانگین پیشرفت */}
                    <div className="mt-3 md:mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {tr("میانگین پیشرفت", "Average Progress")}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {card.avgProgress}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 md:h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full ${card.color}`}
                        style={{ width: `${card.avgProgress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ================= IELTS (v1.0.3.2) ================= */}
      <section className="mx-4 md:mx-5 pt-2 pb-6 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link
            href="/ielts"
            className="group relative block overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-l from-indigo-600 via-blue-600 to-indigo-500 dark:from-indigo-600 dark:via-blue-700 dark:to-indigo-800 p-5 md:p-7 shadow-[0_8px_24px_rgba(79,70,229,0.25)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(79,70,229,0.35)]"
          >
            {/* اشکال تزئینی */}
            <div className="absolute -top-10 -start-10 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -end-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute top-4 end-8 w-14 h-14 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-center gap-4 md:gap-6">
              {/* آیکون */}
              <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-2xl md:rounded-3xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center">
                <GraduationCap size={30} className="md:hidden text-white" />
                <GraduationCap size={42} className="hidden md:block text-white" />
              </div>

              {/* متن */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg md:text-2xl font-black text-white">
                    {tr("آزمون آیلتس", "IELTS Exam")}
                  </h2>
                  <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/30 text-emerald-100">
                    {tr("جدید", "NEW")}
                  </span>
                </div>
                <p className="text-[11px] md:text-sm text-white/85 mt-1 leading-relaxed">
                  {tr(
                    "آزمون‌های شبیه‌ساز کمبریج ۱ تا ۲۱ — لیسنینگ، ریدینگ و رایتینگ با تایمر، تصحیح خودکار و نمرهٔ بند",
                    "Cambridge 1-21 mock exams — Listening, Reading and Writing with timers, auto-scoring and band results",
                  )}
                </p>
                {/* چیپ‌های مهارت */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {[
                    tr("آکادمیک", "Academic"),
                    tr("کمبریج ۱-۲۱", "Cambridge 1-21"),
                    tr("نمرهٔ بند", "Band score"),
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="text-[9px] md:text-[10px] font-medium px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-white/90"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* دکمه */}
              <div className="shrink-0">
                <span className="flex items-center gap-1.5 rounded-xl md:rounded-2xl bg-white text-indigo-700 px-4 md:px-6 py-2 md:py-3 text-[11px] md:text-sm font-bold shadow-md transition group-hover:gap-2.5">
                  <ArrowLeft size={15} className="rtl:rotate-180" />
                  {tr("شروع آمادگی", "Start now")}
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* ================= EXERCISES & GAMES ================= */}
      <section className="mx-4 md:mx-5 pt-2 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/exercises"
            className="flex items-center gap-1 text-blue-600 text-xs md:text-sm font-medium"
          >
            <ArrowLeft size={14} />
            {tr("مشاهده همه", "View All")}
          </Link>
          <h2 className="text-[22px] md:text-[32px] font-bold text-slate-900">
            {tr("تمرین و بازی", "Practice & Games")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
          {exercises.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className={`${item.bgColor} dark:bg-slate-900/70 dark:border dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col gap-3 md:gap-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 relative">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-start">
                  <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
                    {tr(item.titleFa, item.titleEn ?? item.title)}
                  </h3>
                  <p className="text-[11px] md:text-sm text-slate-600 mt-1 leading-tight">
                    {tr(item.description, item.descriptionEn)}
                  </p>
                </div>
              </div>
              <Link href={item.href} className="flex justify-end">
                <button
                  className={`${item.btnColor} dark:brightness-90 px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition hover:opacity-90`}
                >
                  {tr(item.btnLabel, item.btnLabelEn)}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
