"use client";

import { BookOpen, BarChart3, History } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// تب‌های صفحهٔ کتاب — آزمون / آمار / نتیجه (v1.0.4.2)
// (از [book]/page.tsx جدا شد)
// ========================================

export type BookTab = "test" | "stats" | "result";

export default function BookTabs({
  tab,
  onTab,
}: {
  tab: BookTab;
  onTab: (t: BookTab) => void;
}) {
  const { tr } = useLanguage();

  const tabs = [
    { key: "test", label: tr("آزمون", "Test"), Icon: BookOpen },
    { key: "stats", label: tr("آمار", "Statistics"), Icon: BarChart3 },
    { key: "result", label: tr("نتیجه", "Result"), Icon: History },
  ] as const;

  return (
    <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 w-fit">
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onTab(key)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition
            ${
              tab === key
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }
          `}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}
