"use client";

import { CategoryStat } from "@/types/dashboard";

/* ========== کامپوننت کارت آمار ========== */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

/* ========== کامپوننت اصلی عملکرد ========== */

export default function PerformanceBox({
  stats,
  weeklyStats,
  dailyActivity,
  categories,
  streak,
}: {
  stats: {
    totalLessonsThisMonth: number;
    totalXPThisMonth: number;
    avgLessonsPerDay: number;
    totalCourses: number;
    avgProgress: number;
  };
  weeklyStats: { week: string; lessons: number; xp: number }[];
  dailyActivity: { date: string; lessons: number; xp: number }[];
  categories: CategoryStat[];
  streak: { current: number; longest: number };
}) {
  const maxLessons = Math.max(...weeklyStats.map((w) => w.lessons), 1);
  const maxXP = Math.max(...weeklyStats.map((w) => w.xp), 1);
  const last7 = dailyActivity.slice(-7);

  return (
    <div className="space-y-6">
      {/* هدر عملکرد */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-linear-to-l from-emerald-600 to-teal-600 px-6 py-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            عملکرد ماه گذشته
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            آمار یادگیری شما در ۳۰ روز گذشته
          </p>
        </div>

        {/* کارت‌های آمار */}
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="📖"
            label="درس‌های تکمیل شده"
            value={stats.totalLessonsThisMonth}
            color="text-blue-600"
          />
          <StatCard
            icon="⚡"
            label="امتیاز کسب شده"
            value={stats.totalXPThisMonth.toLocaleString("fa-IR")}
            color="text-amber-600"
          />
          <StatCard
            icon="📊"
            label="میانگین درس/روز"
            value={stats.avgLessonsPerDay}
            color="text-emerald-600"
          />
          <StatCard
            icon="🔥"
            label="روز متوالی"
            value={streak.current}
            color="text-orange-600"
          />
        </div>
      </div>

      {/* نمودار هفتگی */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-sm">
            📈
          </span>
          فعالیت هفتگی
        </h3>
        <div className="flex items-end gap-3 h-48">
          {weeklyStats.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                {w.lessons}
              </span>
              <div
                className="w-full relative rounded-t-lg overflow-hidden bg-slate-100"
                style={{ height: "140px" }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${Math.max((w.lessons / maxLessons) * 100, 4)}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {w.week}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* نمودار دسته‌بندی‌ها */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-sm">
            📚
          </span>
          پیشرفت دسته‌بندی‌ها
        </h3>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">
                  {cat.name}
                </span>
                <span className="text-xs text-slate-500">
                  {cat.completed} از {cat.total} درس ({cat.progress}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    cat.name === "گرامر"
                      ? "bg-blue-500"
                      : cat.name === "مکالمه"
                        ? "bg-teal-500"
                        : cat.name === "لغات"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                  }`}
                  style={{ width: `${cat.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* فعالیت ۷ روز اخیر */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-sm">
            📅
          </span>
          فعالیت ۷ روز اخیر
        </h3>
        <div className="flex gap-2 justify-between">
          {last7.map((d, i) => {
            const dayName = new Date(d.date).toLocaleDateString("fa-IR", {
              weekday: "short",
            });
            const hasActivity = d.lessons > 0;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-slate-400">{dayName}</span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    hasActivity
                      ? "bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {d.lessons}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
