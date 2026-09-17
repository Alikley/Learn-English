"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PenLine, ArrowLeft, ArrowRight, Star, Gauge } from "lucide-react";
import { PracticeIcon } from "@/lib/practice-icons";
import { getProgress } from "@/lib/practice-progress";
import type { WritingTopic } from "@/types/training";

function StarsDisplay({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= count
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function WritingListPage() {
  const [topics, setTopics] = useState<WritingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/practice/writing");
        if (res.ok && !cancelled) {
          setTopics(await res.json());
        }
      } catch {
        /* سکوت */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const id = setTimeout(() => void load(), 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto" dir="rtl">
      {/* هدر */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/training"
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="بازگشت به تمرین‌ها"
        >
          <ArrowRight className="h-5 w-5 text-slate-600" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <PenLine className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">تمرین نوشتاری</h1>
          <p className="text-sm text-slate-500">
            بنویس و توسط معلم هوشمند تصحیح کن — ۱۰ موضوع متنوع
          </p>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <PenLine className="h-16 w-16 text-slate-200" />
          <p className="text-slate-500">هنوز موضوعی اضافه نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {topics.map((topic, i) => {
            const progress = hydrated
              ? getProgress("writing", topic.id)
              : null;
            const done = (progress?.stars ?? 0) > 0;
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/training/writing/${topic.id}`}
                  className="block group"
                >
                  <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    {/* بدنه کارت */}
                    <div className="p-5 flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <PracticeIcon
                          name={topic.icon}
                          className="w-6 h-6 text-emerald-600"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm">
                          {topic.titleFa}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 tracking-wide truncate">
                          {topic.titleEn}
                        </p>
                      </div>
                    </div>

                    {/* پایین کارت */}
                    <div className="px-5 pb-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          حداکثر ۲۰۰ کلمه
                        </span>
                        {done && progress && (
                          <span className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              <Gauge className="h-3 w-3" />
                              نمره {progress.score}
                            </span>
                            <StarsDisplay count={progress.stars} />
                          </span>
                        )}
                      </div>

                      <button
                        className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          done
                            ? "bg-slate-50 text-slate-700 hover:bg-slate-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {done ? "نوشتن دوباره" : "شروع نوشتن"}
                      </button>
                    </div>
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
