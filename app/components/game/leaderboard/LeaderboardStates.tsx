"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { RefreshCcw, LogIn, Trophy } from "lucide-react";
import Link from "next/link";

// ========================================
// حالت‌های غیرلیست باکس برترین‌ها
// (از LeaderboardBox تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

/** ورود لازم است */
export function LeaderboardUnauthorized() {
  const { tr } = useLanguage();
  return (
    <div className="py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
        <LogIn className="h-6 w-6 text-blue-500" />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-6 mb-4">
        {tr(
          "برای دیدن رکوردداران اول وارد حسابت شو",
          "Log in first to see the record holders"
        )}
      </p>
      <Link
        href="/login"
        className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
      >
        {tr("ورود", "Log In")}
      </Link>
    </div>
  );
}

/** خطای دریافت — با دکمه تلاش دوباره */
export function LeaderboardFailed({ onReload }: { onReload: () => void }) {
  const { tr } = useLanguage();
  return (
    <div className="py-8 text-center">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        {tr("دریافت رکوردها ناموفق بود", "Couldn't load the records")}
      </p>
      <button
        onClick={() => void onReload()}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        {tr("تلاش دوباره", "Try Again")}
      </button>
    </div>
  );
}

/** هنوز هیچ رکوردی ثبت نشده */
export function LeaderboardEmpty() {
  const { tr } = useLanguage();
  return (
    <div className="py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
        <Trophy className="h-6 w-6 text-amber-500" />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-6">
        {tr(
          "هنوز کسی رکوردی ثبت نکرده — اولین رکورددار این بازی باش!",
          "No records yet — be the first record holder of this game!"
        )}
      </p>
    </div>
  );
}
