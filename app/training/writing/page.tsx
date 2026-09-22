"use client";
import PageLoading from "@/app/components/PageLoading";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  PenLine,
  CheckCircle2,
  Heart,
  UtensilsCrossed,
  Plane,
  Smartphone,
  Briefcase,
  Scale,
  MapPin,
  BookOpen,
  Leaf,
  Mail,
  type LucideIcon,
} from "lucide-react";
import type { WritingTopic } from "@/types/training";
import { Stars } from "@/app/components/practice/PracticeBits";
import { getProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// لیست موضوعات نوشتاری (نسخه ۱.۰.۱.۴)
// ۱۰ موضوع — بنویس و با هوش مصنوعی اصلاح کن
// ========================================

const TOPIC_ICONS: Record<string, LucideIcon> = {
  Heart,
  UtensilsCrossed,
  Plane,
  Smartphone,
  Briefcase,
  Scale,
  MapPin,
  BookOpen,
  Leaf,
  Mail,
};

export default function WritingListPage() {
  const [topics, setTopics] = useState<WritingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/practice/writing");
          if (res.ok) setTopics(await res.json());
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
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <PenLine className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">تمرین نوشتاری</h1>
          <p className="text-sm text-slate-500">
            متنی کوتاه بنویس و هوش مصنوعی آن را اصلاح می‌کند
          </p>
        </div>
        <Link
          href="/training"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-600 text-xs font-bold transition-colors"
        >
          بازگشت
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {topics.map((topic, i) => {
          const Icon = TOPIC_ICONS[topic.icon] ?? PenLine;
          const stars = getProgress("writing", topic.id)?.stars ?? 0;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
            >
              <Link
                href={`/training/writing/${topic.id}`}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 h-full group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  {stars > 0 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1">
                  {topic.titleFa}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mb-3">
                  <HoverableText text={topic.titleEn} />
                </p>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {topic.promptFa}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1 flex-wrap">
                    {topic.usefulWords.slice(0, 2).map((w) => (
                      <span
                        key={w.en}
                        dir="ltr"
                        className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full"
                      >
                        {w.en}
                      </span>
                    ))}
                    {topic.usefulWords.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{topic.usefulWords.length - 2}
                      </span>
                    )}
                  </div>
                  <Stars count={stars} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
