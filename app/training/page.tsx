"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Headphones,
  BookMarked,
  PenLine,
  ArrowLeft,
  Clock,
  Zap,
} from "lucide-react";
import { countCompleted } from "@/lib/practice-progress";
import { ProgressBar } from "@/app/components/practice/PracticeBits";

// ========================================
// هاب تمرین‌ها (نسخه ۱.۰.۱.۴)
// سه بخش: شنیداری / گرامری / نوشتاری — با پیشرفت زنده
// پیشرفت آیتم‌های ایستا در localStorage ذخیره می‌شود
// ========================================

type Totals = { listening: number; grammar: number; writing: number };

const SECTIONS = [
  {
    key: "listening" as const,
    href: "/training/listening",
    title: "تمرین شنیداری",
    titleEn: "Listening Practice",
    subtitle: "پادکست‌ها گوش بده و جاهای خالی را پر کن",
    subtitleEn: "Listen to podcasts and fill in the blanks",
    icon: Headphones,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    barColor: "bg-linear-to-l from-orange-500 to-amber-400",
    chip: "bg-orange-100 text-orange-700",
  },
  {
    key: "grammar" as const,
    href: "/training/grammar",
    title: "تمرین گرامری",
    titleEn: "Grammar Practice",
    subtitle: "۱۵ مجموعه از مبتدی تا پیشرفته با کوئیز",
    subtitleEn: "15 sets from beginner to advanced with quizzes",
    icon: BookMarked,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    barColor: "bg-linear-to-l from-blue-600 to-sky-400",
    chip: "bg-blue-100 text-blue-700",
  },
  {
    key: "writing" as const,
    href: "/training/writing",
    title: "تمرین نوشتاری",
    titleEn: "Writing Practice",
    subtitle: "بنویس و با هوش مصنوعی اصلاحش کن",
    subtitleEn: "Write and let AI correct it",
    icon: PenLine,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    barColor: "bg-linear-to-l from-emerald-600 to-teal-400",
    chip: "bg-emerald-100 text-emerald-700",
  },
];

export default function TrainingPage() {
  const { tr, dir } = useLanguage();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [completed, setCompleted] = useState<Totals | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        // مجموع‌ها از APIها — تعداد انجام‌شده‌ها از localStorage
        const [listening, grammar, writing] = await Promise.all([
          fetch("/api/practice/listening")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => [] as unknown[]),
          fetch("/api/practice/grammar")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => [] as unknown[]),
          fetch("/api/practice/writing")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => [] as unknown[]),
        ]);
        setTotals({
          listening: Array.isArray(listening) ? listening.length : 0,
          grammar: Array.isArray(grammar) ? grammar.length : 0,
          writing: Array.isArray(writing) ? writing.length : 0,
        });
      })();
      setCompleted({
        listening: countCompleted("listening"),
        grammar: countCompleted("grammar"),
        writing: countCompleted("writing"),
      });
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{tr("تمرین‌ها", "Practice")}</h1>
          <p className="text-sm text-slate-500">
            {tr("هر روز کمی تمرین — شنیداری، گرامر و نوشتن", "A little practice every day — listening, grammar and writing")}
          </p>
        </div>
      </div>

      {/* ================= کارت‌های سه بخش ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {SECTIONS.map((s, i) => {
          const total = totals?.[s.key] ?? 0;
          const done = completed?.[s.key] ?? 0;
          const Icon = s.icon;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={s.href}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all p-5 h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 ${s.iconColor}`} />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.chip}`}
                  >
                    {total > 0 ? tr(`${total} آیتم`, `${total} items`) : "..."}
                  </span>
                </div>
                <h2 className="font-bold text-slate-800 mb-1">{tr(s.title, s.titleEn)}</h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {tr(s.subtitle, s.subtitleEn)}
                </p>
                <ProgressBar
                  value={done}
                  total={total}
                  color={s.barColor}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* ================= راهنما ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3"
      >
        <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          {tr(`هر تمرین شنیداری حدود ۵ تا ۷ دقیقه وقت می‌برد، هر مجموعه گرامری ۱۰
          سؤال کوتاه دارد و در نوشتاری متنِ حداکثر ۲۰۰ کلمه‌ای می‌نویسی و
          هوش مصنوعی آن را برایت اصلاح می‌کند. ستاره‌ها بر اساس بهترین نتیجه
          تو ذخیره می‌شوند — ۸۰٪ به بالا سه ستاره، ۶۰٪ دو ستاره و ۴۰٪ یک
          ستاره.`, "Each listening practice takes about 5–7 minutes, each grammar set has 10 short questions, and in writing you write up to 200 words and AI corrects it for you. Stars are saved based on your best result — 80%+ is three stars, 60% two stars and 40% one star.")}
        </p>
      </motion.div>

      {/* لینک قدیمی اپیزودها هنوز از مسیر /training/[episodeId] کار می‌کند */}
      <div className="mt-4 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {tr("بازگشت به داشبورد", "Back to Dashboard")}
        </Link>
      </div>
    </div>
  );
}
