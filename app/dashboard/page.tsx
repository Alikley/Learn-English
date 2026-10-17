"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useDashboard } from "@/app/hooks/useDashboard";
import { useAuth } from "@/app/context/AuthContext";
import ProfileBox from "@/app/components/dashboard/ProfileBox";
import PerformanceBox from "@/app/components/dashboard/PerformanceBox";

/* ========== صفحه اصلی داشبورد ========== */

export default function DashboardPage() {
  const { tr, dir } = useLanguage();
  const { data, loading, saving, updateProfile } = useDashboard();
  const { user: authUser } = useAuth();

  // v1.0.5.2 (English 1.0.1.2) — رفع باگ «روزهای متوالی بدون انجام فعالیت»:
  // قبلاً صرفِ بازدید داشبورد روزِ فعالیت را ثبت می‌کرد (recordStreakActivity
  // روی mount) و کاربرِ تازه‌ثبت‌نام‌شده بلافاصله «۱ روز متوالی» می‌شد — بدون
  // اینکه هیچ فعالیتی (درس/کتاب/تمرین/دوره) را تمام کرده باشد. حذف شد.
  // روزهای متوالی حالا فقط با «تمام‌کردنِ» یک فعالیت فعال می‌شود.

  if (loading || !data) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir={dir}>
      {/* عنوان صفحه */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{tr("داشبورد", "Dashboard")}</h1>
          <p className="text-sm text-slate-500">
            {tr("خلاصه عملکرد و تنظیمات حساب کاربری", "Performance summary and account settings")}
          </p>
        </div>
      </div>

      {/* گرید اصلی */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* باکس ۱: پروفایل */}
        <div className="lg:col-span-1">
          <ProfileBox
            nickname={data.user?.nickname || ""}
            phone={data.user?.phone || ""}
            name={data.user?.name || null}
            email={data.user?.email || null}
            saving={saving}
            onSave={updateProfile}
          />
        </div>

        {/* باکس ۲: عملکرد */}
        <div className="lg:col-span-2">
          <PerformanceBox
            stats={data.stats}
            weeklyStats={data.weeklyStats}
            dailyActivity={data.dailyActivity}
            categories={data.categories}
            streak={data.streak}
          />
        </div>
      </div>
    </div>
  );
}
