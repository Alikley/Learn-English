"use client";

// v1.0.6.5 (English 1.0.1.8) — کارت «یادآور استریک» در /notif
//
// سه حالت:
//  - OneSignal تنظیم نشده → کلاً رندر نمی‌شود (صاحب سایت در
//    DEPLOY.md راهنمای فعال‌سازی دارد؛ کاربر نهایی چیزی نمی‌بیند)
//  - تنظیم‌شده: نمایش وضعیت + دکمهٔ فعال‌سازی (prompt پوش) /
//    غیرفعال‌سازی (optOut + حذف از DB)
//  - در انتظار SDK → اسکلت لودینگ
// ========================================

import { useLanguage } from "@/app/context/LanguageContext";
import { BellRing, BellOff, Flame, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type SdkState = "waiting" | "ready" | "hidden";

export default function PushReminderCard() {
  const { tr, dir } = useLanguage();
  const [sdk, setSdk] = useState<SdkState>("waiting");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [denied, setDenied] = useState(false);

  const refresh = useCallback(() => {
    try {
      const os = window.OneSignal;
      if (!os) return;
      setDenied(
        typeof Notification !== "undefined" &&
          Notification.permission === "denied",
      );
      setSubscribed(
        Boolean(os.User.PushSubscription.id) &&
          os.Notifications.permission === "granted",
      );
    } catch {
      /* SDK هنوز آماده نیست */
    }
  }, []);

  useEffect(() => {
    const onReady = () => {
      setSdk("ready");
      refresh();
    };
    window.addEventListener("flex:onesignal-ready", onReady);
    return () => window.removeEventListener("flex:onesignal-ready", onReady);
  }, [refresh]);

  // اگر SDK از قبل لود بوده ولی رویداد را از دست دادیم — تا ۸ ثانیه
  // چک کن؛ SDK نبود (= تنظیم نشده) → کارت کلاً مخفی می‌شود
  useEffect(() => {
    if (sdk !== "waiting") return;
    const started = Date.now();
    const t = setInterval(() => {
      if (window.OneSignal) {
        clearInterval(t);
        setSdk("ready");
        refresh();
      } else if (Date.now() - started > 8000) {
        clearInterval(t);
        setSdk("hidden");
      }
    }, 500);
    return () => clearInterval(t);
  }, [sdk, refresh]);

  // ⚠️ تنظیم نشده → هیچ چیزی نمایش نده
  if (sdk !== "ready") return null;

  const enable = async () => {
    setNotice("");
    setBusy(true);
    try {
      const os = window.OneSignal;
      if (!os) return;

      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "denied"
      ) {
        setNotice(
          tr(
            "اجازهٔ اعلان در مرورگر بلاک شده — از تنظیمات سایت (آیکن قفل کنار آدرس) اعلان‌ها را Allow کنید.",
            "Notifications are blocked in your browser — allow them from the site settings (lock icon next to the address).",
          ),
        );
        return;
      }

      // اسلاید‌داون رسمی OneSignal → درخواست اجازهٔ اعلان
      await os.Slidedown.promptPush();

      // بعد از پذیرش، SDK اشتراک می‌سازد و OneSignalSetup آن را
      // در دیتابیس ثبت می‌کند (رویداد change) — فقط UI را تازه کن
      setTimeout(refresh, 1200);
    } catch (e) {
      console.error("[push] enable failed:", e);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setNotice("");
    setBusy(true);
    try {
      const os = window.OneSignal;
      if (!os) return;

      const subId = os.User.PushSubscription.id;
      // حذف از دیتابیس سرور (دیگر یادآور نمی‌آید)
      if (subId) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: subId }),
        }).catch(() => null);
      }
      // لغو اشتراک در OneSignal (این دستگاه)
      await os.User.PushSubscription.optOut().catch(() => null);
      setSubscribed(false);
    } catch (e) {
      console.error("[push] disable failed:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      dir={dir}
      className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center">
            <Flame size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              {tr("یادآور استریک (پوش)", "Streak Reminder (Push)")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tr(
                "اگر امروز تمرین نکرده باشی، شب یادآوری به‌وقت برایت می‌آید",
                "A timely nudge in the evening if you haven't practiced today",
              )}
            </p>
          </div>
        </div>

        {denied ? (
          <p className="text-sm text-red-600 dark:text-red-400 leading-7">
            {tr(
              "اعلان‌ها در مرورگر بلاک شده‌اند. روی آیکن قفل کنار نوار آدرس کلیک کنید و Notifications را Allow کنید.",
              "Notifications are blocked — click the lock icon in the address bar and set Notifications to Allow.",
            )}
          </p>
        ) : subscribed ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium">
              <ShieldCheck size={18} />
              {tr("فعال — یادآور شبانه روشن است", "Active — nightly reminder is on")}
            </div>
            <button
              onClick={disable}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
            >
              <BellOff size={16} />
              {tr("غیرفعال‌کردن", "Disable")}
            </button>
          </div>
        ) : (
          <button
            onClick={enable}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <BellRing size={16} />
            {tr("فعال‌سازی یادآور استریک", "Enable Streak Reminder")}
          </button>
        )}

        {notice && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 leading-6">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
