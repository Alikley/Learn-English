"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Flame,
  GraduationCap,
  ClipboardList,
  Trophy,
  BookMarked,
  Headphones,
  BookOpen,
  Sparkles,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNotifications } from "@/app/context/NotificationContext";
import { useState } from "react";
import PushReminderCard from "@/app/components/push/PushReminderCard";

// ========================================
// صفحهٔ اعلان‌ها (v1.0.6.9 / English 1.0.1.12)
// بازنویسی برای اعلان‌های واقعی: لیست از دیتابیس می‌آید
// (NotificationContext → /api/notifications)، هر نوع اعلان
// آیکون و رنگ خودش را دارد، با خواندن همه/حذف/مشاهده.
// ========================================

/** آیکون و رنگ چیپ هر نوع اعلان */
const TYPE_ICONS: Record<string, { Icon: LucideIcon; chip: string }> = {
  streak: {
    Icon: Flame,
    chip: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
  },
  course: {
    Icon: GraduationCap,
    chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  ielts: {
    Icon: ClipboardList,
    chip: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  game: {
    Icon: Trophy,
    chip: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  vocab: {
    Icon: BookMarked,
    chip: "bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300",
  },
  listening: {
    Icon: Headphones,
    chip: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  book: {
    Icon: BookOpen,
    chip: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
  welcome: {
    Icon: Sparkles,
    chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
};

const DEFAULT_TYPE_ICON: { Icon: LucideIcon; chip: string } = {
  Icon: Bell,
  chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export default function NotificationsPage() {
  const { tr } = useLanguage();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    formatTimeAgo,
  } = useNotifications();

  // برای باز/بسته شدن
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      markAsRead(id); // وقتی باز می‌شود، خوانده شده می‌شود
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-4">
          {/* v1.0.5.0 — بازگشت به پنل اصلی */}
          <Link
            href="/home"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {tr("اعلان‌ها", "Notifications")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {unreadCount} {tr("عدد خوانده نشده", "unread")}
          </span>
          {/* v1.0.6.9 — خواندن همه (فقط وقتی ناخوانده هست) */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              <CheckCheck size={14} />
              <span>{tr("خواندن همه", "Mark all as read")}</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* حالت بارگذاری — ۳ ردیف اسکلتون */}
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/5 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">
              {tr("هیچ پیامی وجود ندارد.", "No messages.")}
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const { Icon, chip } = TYPE_ICONS[notif.type] ?? DEFAULT_TYPE_ICON;
            return (
              <div
                key={notif.id}
                className={`rounded-xl shadow-sm overflow-hidden border ${
                  !notif.isRead
                    ? "bg-blue-50/80 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                }`}
              >
                <div
                  className="p-4 cursor-pointer flex items-start justify-between gap-3"
                  onClick={() => handleToggle(notif.id)}
                >
                  <div className="flex-1 flex items-start gap-3">
                    {/* آیکون نوع اعلان */}
                    <span
                      className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-full ${chip}`}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-medium ${
                            !notif.isRead
                              ? "text-blue-800 dark:text-blue-200"
                              : "text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {tr("جدید", "New")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                  {expandedId === notif.id ? (
                    <ChevronUp
                      size={20}
                      className="text-slate-400 dark:text-slate-500 shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      className="text-slate-400 dark:text-slate-500 shrink-0"
                    />
                  )}
                </div>

                {expandedId === notif.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-white dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                      {notif.text}
                    </div>
                    <div className="mt-3 flex justify-end items-center gap-2">
                      {/* لینک «مشاهده» — اگر اعلان لینک داخلی داشته باشد */}
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <span>{tr("مشاهده", "View")}</span>
                          <ArrowLeft size={14} />
                        </Link>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>{tr("حذف پیام", "Delete Message")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* v1.0.6.5 — یادآور استریک با پوش OneSignal
          (اگر تنظیم نشده باشد، کلاً رندر نمی‌شود) */}
      <PushReminderCard />
    </div>
  );
}
