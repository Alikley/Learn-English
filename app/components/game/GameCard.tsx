"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowLeft, Clock } from "lucide-react";

// ========================================
// کارت یک بازی در هاب بازی‌ها
// - بازی فعال: لینک به صفحه خودش
// - بازی آینده: غیرفعال با بج «به‌زودی»
// ========================================

export default function GameCard({
  title,
  desc,
  icon,
  href,
  disabled = false,
  stats,
}: {
  title: string;
  desc: string;
  icon: string; // مسیر آیکون svg در public/assets
  href: string;
  disabled?: boolean;
  stats?: React.ReactNode; // آمار کوچک روی کارت (اختیاری)
}) {
  const { tr } = useLanguage();

  const inner = (
    <>
      {/* آیکون بازی */}
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        <Image src={icon} alt={title} width={36} height={36} className="w-9 h-9" />
      </div>

      {/* عنوان و توضیح */}
      <div className="flex-1 min-w-0 text-start">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-5">{desc}</p>
        {stats}
      </div>

      {/* دکمه / بج */}
      {disabled ? (
        <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 text-[11px] font-bold">
          <Clock className="w-3.5 h-3.5" />
          {tr("به‌زودی", "Coming Soon")}
        </span>
      ) : (
        <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
        </span>
      )}
    </>
  );

  const cardClasses = `w-full flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
    disabled
      ? "border-slate-100 bg-slate-50/50 opacity-70 cursor-not-allowed"
      : "border-slate-100 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md"
  }`;

  if (disabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        aria-disabled
        className={cardClasses}
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link href={href} className={`${cardClasses} block`}>
        {inner}
      </Link>
    </motion.div>
  );
}
