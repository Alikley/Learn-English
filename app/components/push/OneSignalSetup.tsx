"use client";

// ========================================
// v1.0.6.6 (English 1.0.1.9) — بارگذاری OneSignal Web SDK (v16)
//
// این کامپوننت در layout ریشه نشسته و appId را به‌صورت prop از
// سرور می‌گیرد (خواندن env در زمان درخواست — نه موقع بیلد).
//  - appId خالی → هیچ چیزی لود/رندر نمی‌شود (اپ سالم می‌مانَد)
//  - appId تنظیم‌شده → اسکریپت رسمی OneSignal SDK لود می‌شود،
//    init انجام می‌شود و شنوندهٔ تغییرِ اشتراک، subscription ID
//    را برای کاربرِ واردشده در /api/push/subscribe ثبت می‌کند
//
// v1.0.6.6:
//  - allowLocalhostAsSecureOrigin در لوکال (طبق مستندات رسمی
//    «Local testing») → تست لوکال فقط در مرورگرهای کرومیومی.
//  - اگر init شکست خورد (مثل «App not configured for web push»
//    وقتی وب‌پوش در داشبورد تنظیم نشده)، رویداد «flex:onesignal-error»
//    با کدِ تفکیک‌شده پخش می‌شود تا PushReminderCard پیامِ راهنما
//    نشان دهد (به‌جای خطای خام کنسول).
//
// برای UI تنظیم (فعال/غیرفعال‌کردن یادآور) → PushReminderCard
// که روی /notif نشسته و به رویداد "flex:onesignal-ready" گوش
// می‌دهد (همین فایل پخش می‌کند).
// ========================================

import { useEffect } from "react";

/** کد خطای init — تفکیک برای پیام راهنمای دقیق در UI */
export type OneSignalInitErrorCode =
  | "web-push-not-configured"
  | "wrong-site"
  | "other";

export type OneSignalInitError = {
  code: OneSignalInitErrorCode;
  message: string;
};

/** زیرمجموعهٔ SDK که استفاده می‌کنیم (تایپِ سبک — خود SDK کامل است) */
export type OneSignalNamespace = {
  init: (options: {
    appId: string;
    /** مستندات رسمی: برای تست لوکال (فقط مرورگرهای کرومیومی) */
    allowLocalhostAsSecureOrigin?: boolean;
  }) => Promise<void>;
  Slidedown: { promptPush: () => Promise<void> };
  Notifications: { permission: string };
  User: {
    PushSubscription: {
      id: string | null;
      optOut: () => Promise<void>;
      addEventListener: (
        event: "change",
        cb: (e: { current: { id?: string | null } }) => void,
      ) => void;
    };
  };
};

declare global {
  interface Window {
    OneSignal?: OneSignalNamespace;
    OneSignalDeferred?: Array<(ns: OneSignalNamespace) => Promise<void> | void>;
  }
}

const SDK_URL = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";

/** ثبت اشتراک برای کاربرِ واردشده (401 مهمان = بی‌صدا) */
async function registerSubscription(subscriptionId: string) {
  try {
    const session = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
    if (!session?.user) return; // مهمان — چیزی ثبت نمی‌شود

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    });
  } catch {
    // شبکه/سرور موقتاً در دسترس نیست — دفعهٔ بعد (لود بعدی) دوباره
  }
}

/** لوکال هستیم؟ (localhost/127.0.0.1 با هر پورت) */
function isLocalOrigin(): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(
    window.location.origin,
  );
}

/** تبدیل پیام خطای SDK به کدِ قابل‌استفاده در UI */
export function classifyOneSignalError(
  message: string,
): OneSignalInitErrorCode {
  if (/not configured for web push/i.test(message)) {
    return "web-push-not-configured";
  }
  if (/can only be used on/i.test(message) || /wrongsiteurl/i.test(message)) {
    return "wrong-site";
  }
  return "other";
}

export default function OneSignalSetup({ appId }: { appId?: string }) {
  useEffect(() => {
    if (!appId) return;

    // اسکریپت SDK — فقط یک بار
    if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.defer = true;
      document.head.appendChild(script);
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init(
          isLocalOrigin()
            ? { appId, allowLocalhostAsSecureOrigin: true }
            : { appId },
        );

        // به کارتِ تنظیم (روی /notif) بگویم SDK آماده است
        window.dispatchEvent(new CustomEvent("flex:onesignal-ready"));

        // اشتراکِ موجود → همین حالا ثبت (کاربرِ برگشته)
        const currentId = OneSignal.User.PushSubscription.id;
        if (currentId && OneSignal.Notifications.permission === "granted") {
          await registerSubscription(currentId);
        }

        // تغییر اشتراک (فعال‌کردن از کارت) → ثبت
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          const id = event?.current?.id;
          if (id && OneSignal.Notifications.permission === "granted") {
            void registerSubscription(id);
          }
        });
      } catch (e) {
        // خطای init — قابل‌درک برای کاربر گزارش شود، نه فقط کنسول
        const message = e instanceof Error ? e.message : String(e);
        console.error("[onesignal] init failed:", e);
        window.dispatchEvent(
          new CustomEvent<OneSignalInitError>("flex:onesignal-error", {
            detail: {
              code: classifyOneSignalError(message),
              message: message.slice(0, 300),
            },
          }),
        );
      }
    });
  }, [appId]);

  // این کامپوننت چیزی رندر نمی‌کند — فقط زیرساخت
  return null;
}
