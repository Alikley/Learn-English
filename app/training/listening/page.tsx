"use client";
import PageLoading from "@/app/components/PageLoading";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Headphones, Clock, Zap, Volume2, CheckCircle2 } from "lucide-react";
import { getListeningLevel } from "@/types/listening";
import type { ListeningItem } from "@/types/training";
import { Stars } from "@/app/components/practice/PracticeBits";
import { getProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// لیست تمرین شنیداری (نسخه ۱.۰.۱.۴)
// ادغام قسمت‌های دیتابیس + پادکست‌های تلفظ مرورگر
// ========================================

type ListItem = ListeningItem & {
  progress: { stars: number } | null;
};

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  return `${m} دقیقه`;
}

export default function ListeningListPage() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/practice/listening");
          if (res.ok) {
            const data = (await res.json()) as ListItem[];
            setItems(data);
          }
        } catch {
          /* silent */
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (loading) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Headphones className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">تمرین شنیداری</h1>
          <p className="text-sm text-slate-500">
            گوش بده و جاهای خالی را با کلمه‌ای که می‌شنوی پر کن
          </p>
        </div>
        <Link
          href="/training"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-600 text-xs font-bold transition-colors"
        >
          بازگشت
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Headphones className="h-16 w-16 text-slate-200" />
          <p className="text-slate-500">هنوز تمرین شنیداری اضافه نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {items.map((item, i) => {
            const levelInfo = getListeningLevel(item.level);
            // برای پادکست‌ها پیشرفت از localStorage — برای دیتابیس از خود API
            const stored = getProgress("listening", item.id);
            const stars = stored?.stars ?? item.progress?.stars ?? 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
              >
                <Link
                  href={`/training/listening/${item.id}`}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all p-5 h-full group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {item.source === "podcast" ? (
                        <Volume2 className="w-5 h-5 text-orange-600" />
                      ) : (
                        <Headphones className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${levelInfo.color}`}
                    >
                      {levelInfo.fa}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1 line-clamp-2">
                    {item.titleFa}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mb-3">
                    <HoverableText text={item.title} />
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {fmtDuration(item.duration)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {item.xp} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <Stars count={stars} />
                    {stars > 0 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
