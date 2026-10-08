"use client";

import Link from "next/link";
import {
  Headphones,
  PenLine,
  ClipboardList,
  Award,
  FileText,
  Music4,
  Flame,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsBookSummary } from "@/types/ielts";
import type { BookStats } from "@/app/hook/ielts/useCambridgeLibrary";

// ========================================
// کارت یک کتاب کمبریج (v1.0.4.2)
// سربرگ گرادیانی + سه چیپ مهارت + وضعیت فایل‌های B2 + بهترین بند
// (از cambridge/page.tsx جدا شد)
// ========================================

function SkillChip({
  icon,
  label,
  meta,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-2.5 text-center space-y-1">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
        {icon}
      </span>
      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{label}</p>
      <p className="text-[9px] text-slate-400" dir="ltr">{meta}</p>
    </div>
  );
}

export default function BookCard({
  book,
  index,
  stats,
}: {
  book: IeltsBookSummary;
  index: number;
  stats?: BookStats;
}) {
  const { tr } = useLanguage();
  const num = String(book.id).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link
        href={`/ielts/cambridge/${book.id}`}
        className="group block rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(79,70,229,0.14)]"
      >
        {/* سربرگ کارت */}
        <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 p-4 text-white">
          <div className="absolute -top-8 -end-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute bottom-0 start-1/3 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-lg font-black">
              {num}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold" dir="ltr">
                Cambridge {num}
              </h3>
              <p className="text-[10px] text-white/80">
                {tr("۴ تست کامل — آکادمیک", "4 complete tests — Academic")}
              </p>
            </div>
            {stats && stats.inProgress > 0 && (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-sky-400/25 border border-sky-300/30 flex items-center gap-1">
                <Flame size={9} />
                {tr("در جریان", "In progress")}
              </span>
            )}
          </div>
        </div>

        {/* مهارت‌ها — ترتیب آزمون واقعی: لیسنینگ، ریدینگ، رایتینگ (v1.0.0.7) */}
        <div className="p-4 grid grid-cols-3 gap-2">
          <SkillChip
            icon={<Headphones size={13} />}
            label={tr("لیسنینگ", "Listening")}
            meta={`40 Q · 30′`}
          />
          <SkillChip
            icon={<ClipboardList size={13} />}
            label={tr("ریدینگ", "Reading")}
            meta={`40 Q · 60′`}
          />
          <SkillChip
            icon={<PenLine size={13} />}
            label={tr("رایتینگ", "Writing")}
            meta={`2 ${tr("تسک", "tasks")} · 60′`}
          />
        </div>

        {/* وضعیت فایل‌های B2 + بهترین بند */}
        <div className="px-4 pb-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${
                book.files.pdf
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              dir="ltr"
            >
              <FileText size={10} />
              {book.files.pdf ? "PDF" : "PDF ?"}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${
                book.files.audioCount > 0
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              dir="ltr"
            >
              <Music4 size={10} />
              {book.files.audioCount > 0 ? `${book.files.audioCount} audio` : "audio ?"}
            </span>
            {stats && stats.bestBand != null && (
              <span
                className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/25"
                dir="ltr"
              >
                <Award size={10} />
                best {stats.bestBand}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 group-hover:underline">
            {tr("۴ تست", "4 tests")} ←
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
