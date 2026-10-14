"use client";

// v1.0.6.6 (English 1.0.1.9) — کارت «یادآور استریک» در /notif
//
// حالت‌ها:
//  - OneSignal تنظیم نشده → کلاً رندر نمی‌شود (صاحب سایت در
//    DEPLOY.md راهنمای فعال‌سازی دارد؛ کاربر نهایی چیزی نمی‌بیند)
//  - تنظیم‌شده: نمایش وضعیت + دکمهٔ فعال‌سازی (prompt پوش) /
//    غیرفعال‌سازی (optOut + حذف از DB)
//  - init شکست خورد (v1.0.6.6): پیام راهنمای دقیق + «تشخیص خودکار»
//    — مثلاً وقتی وب‌پوش در داشبورد OneSignal تنظیم نشده باشد
//    (خطای «App not configured for web push»)
//  - در انتظار SDK → اسکلت لودینگ
// ========================================

import { useLanguage } from "@/app/context/LanguageContext";
import { BellRing, BellOff, Flame, ShieldCheck, AlertTriangle, Stethoscope } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { OneSignalInitError } from "./OneSignalSetup";

type SdkState = "waiting" | "ready" | "hidden" | "error";

type DiagnoseVerdict = { level: string; fa: string; en: string };

const VERDICT_STYLES: Record<string, string> = {
  ok: "text-green-700 dark:text-green-400",
  info: "text-slate-600 dark:text-slate-300",
  warn: "text-amber-700 dark:text-amber-400",
  error: "text-red-700 dark:text-red-400",
};

export default function PushReminderCard() {
  const { tr, dir } = useLanguage();
  const [sdk, setSdk] = useState<SdkState>("waiting");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [denied, setDenied] = useState(false);
  const [initError, setInitError] = useState<OneSignalInitError | null>(null);
  const [verdicts, setVerdicts] = useState<DiagnoseVerdict[] | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);

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
    const onError = (e: Event) => {
      const detail = (e as CustomEvent<OneSignalInitError>).detail;
      setInitError(detail ?? null);
      setSdk("error");
    };
    window.addEventListener("flex:onesignal-ready", onReady);
    window.addEventListener("flex:onesignal-error", onError);
    return () => {
      window.removeEventListener("flex:onesignal-ready", onReady);
      window.removeEventListener("flex:onesignal-error", onError);
    };
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
  if (sdk === "hidden" || (sdk === "waiting" && !initError)) return null;

  const runDiagnose = async () => {
    setDiagnosing(true);
    setVerdicts(null);
    try {
      const res = await fetch("/api/notify/diagnose").then((r) => r.json()).catch(() => null);
      if (res?.verdicts) {
        setVerdicts(res.verdicts as DiagnoseVerdict[]);
      } else {
        setNotice(
          tr("تشخیص خودکار در دسترس نبود — چند لحظه بعد دوباره امتحان کنید", "Auto-diagnose unavailable — try again in a moment"),
        );
      }
    } finally {
      setDiagnosing(false);
    }
  };

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

  /** پیام راهنمای اختصاصی هر کد خطا */
  const errorHelp = (): { fa: string; en: string } => {
    switch (initError?.code) {
      case "web-push-not-configured":
        return {
          fa: "وب‌پوش برای این اپ در داشبورد OneSignal فعال نشده است. در داشبورد: Settings → Push & In-App (Channels) → Web → گزینهٔ Typical Site → آدرس سایت (مثلاً https://learn-english-wine.vercel.app) را وارد و ذخیره کنید. توجه: هر اپ OneSignal فقط روی یک دامنه کار می‌کند.",
          en: "Web push is not enabled for this app in the OneSignal dashboard. Dashboard → Settings → Push & In-App (Channels) → Web → Typical Site → enter your site URL (e.g. https://learn-english-wine.vercel.app) → Save. Note: each OneSignal app works on a single origin.",
        };
      case "wrong-site":
        return {
          fa: "دامنهٔ فعلی صفحه با دامنهٔ ثبت‌شده در داشبورد OneSignal فرق دارد — OneSignal فقط روی همان دامنه کار می‌کند (یک اپ = یک دامنه؛ برای تست لوکال یک اپ توسعهٔ جدا بسازید).",
          en: "The current page origin differs from the origin configured in the OneSignal dashboard — OneSignal only works on the configured origin (one app = one origin; create a separate dev app for localhost).",
        };
      default:
        return {
          fa: `راه‌اندازی پوش با خطا مواجه شد: ${initError?.message || "نامشخص"}`,
          en: `Push setup failed: ${initError?.message || "unknown"}`,
        };
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

        {sdk === "error" ? (
          <div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg text-sm text-amber-800 dark:text-amber-300 leading-6">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p>{tr(errorHelp().fa, errorHelp().en)}</p>
            </div>
            <button
              onClick={runDiagnose}
              disabled={diagnosing}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
            >
              {diagnosing ? (
                <span className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-500 rounded-full animate-spin" />
              ) : (
                <Stethoscope size={16} />
              )}
              {tr("تشخیص خودکار مشکل پوش", "Auto-diagnose push issue")}
            </button>
          </div>
        ) : denied ? (
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

        {verdicts && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-lg text-xs leading-6 space-y-1.5">
            <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
              {tr("نتیجهٔ تشخیص خودکار:", "Auto-diagnose results:")}
            </p>
            {verdicts.map((v, i) => (
              <p key={i} className={VERDICT_STYLES[v.level] ?? VERDICT_STYLES.info}>
                {tr(v.fa, v.en)}
              </p>
            ))}
          </div>
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
