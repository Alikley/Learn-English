"use client";

import Link from "next/link";
import { useListening } from "@/app/hook/useListening";
import { Headphones, Star, Clock, Zap, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { getListeningLevel } from "@/types/listening";

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

export default function TrainingPage() {
  const { episodes, loading } = useListening();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto" dir="rtl">
      {/* هدر */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Headphones className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">تمرین شنیداری</h1>
          <p className="text-sm text-slate-500">
            به پادکست‌ها گوش بده و متن جاخالی رو پر کن
          </p>
        </div>
      </div>

      {episodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Headphones className="h-16 w-16 text-slate-200" />
          <p className="text-slate-500">هنوز تمرین شنیداری اضافه نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {episodes.map((ep, i) => {
            const levelInfo = getListeningLevel(ep.level);
            const done = ep.progress && ep.progress.stars > 0;
            const minutes = Math.floor(ep.duration / 60);
            const seconds = ep.duration % 60;

            return (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/training/${ep.id}`} className="block group">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    {/* هدر کارت */}
                    <div className="bg-linear-to-l from-orange-500 to-amber-500 px-5 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-base">
                            {ep.titleFa}
                          </h3>
                          <p className="text-orange-100 text-xs mt-1">
                            {ep.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                          <Zap className="h-3.5 w-3.5 text-yellow-200" />
                          <span className="text-xs font-bold text-white">
                            {ep.xp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* بدنه کارت */}
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {ep.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelInfo.color}`}
                          >
                            {levelInfo.fa}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {minutes}:{seconds.toString().padStart(2, "0")}
                          </span>
                        </div>

                        {done && <StarsDisplay count={ep.progress!.stars} />}
                      </div>

                      {/* دکمه */}
                      <button
                        className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          done
                            ? "bg-slate-50 text-slate-700 hover:bg-slate-100"
                            : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        }`}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {done ? "تلاش مجدد" : "شروع تمرین"}
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
