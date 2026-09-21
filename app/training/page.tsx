"use client";

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
import { useLanguage } from "@/app/context/LanguageContext";

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
    titleKey: "training.listening.title",
    subtitleKey: "training.listening.sub2",
    icon: Headphones,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    barColor: "bg-linear-to-l from-orange-500 to-amber-400",
    chip: "bg-orange-100 text-orange-700",
  },
  {
    key: "grammar" as const,
    href: "/training/grammar",
    titleKey: "training.grammar.title",
    subtitleKey: "training.grammar.sub2",
    icon: BookMarked,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    barColor: "bg-linear-to-l from-blue-600 to-sky-400",
    chip: "bg-blue-100 text-blue-700",
  },
  {
    key: "writing" as const,
    href: "/training/writing",
    titleKey: "training.writing.title",
    subtitleKey: "training.writing.sub2",
    icon: PenLine,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    barColor: "bg-linear-to-l from-emerald-600 to-teal-400",
    chip: "bg-emerald-100 text-emerald-700",
  },
];

export default function TrainingPage() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [completed, setCompleted] = useState<Totals | null>(null);
  const { t } = useLanguage();

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
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t("training.title")}</h1>
          <p className="text-sm text-slate-500">{t("training.sub")}</p>
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
                    {total > 0 ? `${total} ${t("common.items")}` : "..."}
                  </span>
                </div>
                <h2 className="font-bold text-slate-800 mb-1">{t(s.titleKey)}</h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {t(s.subtitleKey)}
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
        <p className="text-xs text-slate-500 leading-relaxed">{t("training.guide")}</p>
      </motion.div>

      {/* لینک قدیمی اپیزودها هنوز از مسیر /training/[episodeId] کار می‌کند */}
      <div className="mt-4 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("training.backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
