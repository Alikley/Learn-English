"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// زمینهٔ اعلان‌های واقعی کاربر (v1.0.6.9 / English 1.0.1.12)
//
// - داده‌ها از /api/notifications (MySQL، ساخته‌شده از
//   رویدادهای واقعی سایت توسط lib/notify.ts) — نه آرایهٔ الکی
// - فقط برای کاربرِ واردشده واکشی می‌شود (useSession)؛ بدون
//   سشن لیست خالی است (state مشتق — بدون setState همگام در افکت)
// - پول هر ۶۰ ثانیه + هنگام فوکوس پنجره
// - متن دوزبانه: بر اساس زبان سایت fa/en انتخاب می‌شود
//   (این پروایدر داخل LanguageProvider رندر می‌شود — AppShell)
// - تغییرها خوش‌بینانه (اُپتی‌میس) اعمال و بعد به API فرستاده
//   می‌شوند؛ اگر سرور نپذیرفت، رفرش واقعی می‌آید
// ========================================

/** اعلان آمادهٔ نمایش — متن‌ها بر اساس زبان سایت انتخاب شده‌اند */
export type UserNotification = {
  id: string;
  type: string;
  title: string;
  text: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

/** شکل خام ردیف اعلان از API (ستون‌های fa/en جدا) */
type RawNotificationRow = {
  id: string;
  type: string;
  titleFa: string;
  titleEn: string | null;
  textFa: string;
  textEn: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationContextType = {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  /** «۵ دقیقه پیش» / «دیروز» / تاریخ — بر اساس زبان سایت */
  formatTimeAgo: (iso: string) => string;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

/** تبدیل ارقام لاتین به فارسی (۰۱۲۳۴۵۶۷۸۹) — نسخهٔ کلاینتِ lib/notify.ts */
export function faDigits(x: string | number): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return String(x).replace(/[0-9]/g, (d) => fa[Number(d)]);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  // ردیف‌های خام + شمارش ناخوانده از سرور
  // (وقتی سشن نیست، این دو «نمایش داده نمی‌شوند» — پایین‌تر مشتق می‌شوند)
  const [rawRows, setRawRows] = useState<RawNotificationRow[]>([]);
  const [rawUnread, setRawUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const { lang } = useLanguage();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // اسکلتون فقط قبل از اولین واکشیِ کاربرِ واردشده
  // (حالت loading سشن next-auth هم اسکلتون است)
  const loading = status === "loading" || (isAuthenticated && !loaded);

  /** واکشی تازه از سرور — 401/خطا = پاک‌سازی (نشست نیست) */
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) {
        setRawRows([]);
        setRawUnread(0);
        return;
      }
      const data: { notifications?: unknown; unreadCount?: unknown } =
        await res.json();
      setRawRows(Array.isArray(data?.notifications) ? data.notifications : []);
      setRawUnread(
        typeof data?.unreadCount === "number" ? data.unreadCount : 0,
      );
    } catch {
      // بی‌خیال — پول/فوکوس بعدی دوباره تلاش می‌کند
    } finally {
      setLoaded(true);
    }
  }, []);

  // واکشی اولیه فقط وقتی سشن معتبر است
  useEffect(() => {
    if (status !== "authenticated") return;
    // avoid calling setState synchronously within effect body
    // (همان الگوی تاخیریِ useStreak — سازگار با React Compiler)
    const t = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(t);
  }, [status, refresh]);

  // پول هر ۶۰ ثانیه + واکشی هنگام برگشتن به تب
  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(() => {
      void refresh();
    }, 60_000);
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [status, refresh]);

  // انتخاب متن بر اساس زبان سایت (fa پیش‌فرض) — بدون سشن لیست خالی
  const notifications = useMemo<UserNotification[]>(
    () =>
      isAuthenticated
        ? rawRows.map((r) => ({
            id: r.id,
            type: r.type,
            title: lang === "en" && r.titleEn ? r.titleEn : r.titleFa,
            text: lang === "en" && r.textEn ? r.textEn : r.textFa,
            link: r.link,
            isRead: r.isRead,
            createdAt: r.createdAt,
          }))
        : [],
    [rawRows, lang, isAuthenticated],
  );

  // بدون سشن، ناخوانده‌ای برای نمایش نیست
  const unreadCount = isAuthenticated ? rawUnread : 0;

  /** زمان نسبی خوانا بر اساس زبان سایت */
  const formatTimeAgo = useCallback(
    (iso: string): string => {
      const date = new Date(iso);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

      if (diffSec < 60) {
        return lang === "en" ? "just now" : "همین حالا";
      }
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return lang === "en"
          ? `${diffMin}m ago`
          : `${faDigits(diffMin)} دقیقه پیش`;
      }
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) {
        return lang === "en"
          ? `${diffHour}h ago`
          : `${faDigits(diffHour)} ساعت پیش`;
      }

      // فاصلهٔ روزهایی (نیمه‌شب‌ها) برای «دیروز» و «روز»
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayDiff = Math.round(
        (todayStart.getTime() - dayStart.getTime()) / 86_400_000,
      );

      if (dayDiff === 1) {
        return lang === "en" ? "yesterday" : "دیروز";
      }
      if (dayDiff < 7) {
        return lang === "en"
          ? `${dayDiff}d ago`
          : `${faDigits(dayDiff)} روز پیش`;
      }
      return date.toLocaleDateString(lang === "en" ? "en-US" : "fa-IR", {
        day: "numeric",
        month: "long",
      });
    },
    [lang],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      // خوش‌بینانه: فوری در UI
      const wasUnread = rawRows.some((r) => r.id === id && !r.isRead);
      setRawRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isRead: true } : r)),
      );
      if (wasUnread) setRawUnread((prev) => Math.max(0, prev - 1));

      try {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) await refresh();
      } catch {
        await refresh();
      }
    },
    [rawRows, refresh],
  );

  const markAllAsRead = useCallback(async () => {
    // خوش‌بینانه: همه خوانده + صفر
    setRawRows((prev) => prev.map((r) => ({ ...r, isRead: true })));
    setRawUnread(0);

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) await refresh();
    } catch {
      await refresh();
    }
  }, [refresh]);

  const deleteNotification = useCallback(
    async (id: string) => {
      // خوش‌بینانه: حذف فوری (اگر ناخوانده بود، شمارش هم کم شود)
      const row = rawRows.find((r) => r.id === id);
      setRawRows((prev) => prev.filter((r) => r.id !== id));
      if (row && !row.isRead) {
        setRawUnread((prev) => Math.max(0, prev - 1));
      }

      try {
        await fetch("/api/notifications", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch {
        // بی‌خیال — پول بعدی درست می‌کند
      }
    },
    [rawRows],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead: (id: string) => {
          void markAsRead(id);
        },
        markAllAsRead: () => {
          void markAllAsRead();
        },
        deleteNotification: (id: string) => {
          void deleteNotification(id);
        },
        formatTimeAgo,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
}
