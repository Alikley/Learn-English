"use client";

// ========================================
// v1.0.6.5 (English 1.0.1.8) — بارگذاری OneSignal Web SDK (v16)
//
// این کامپوننت در layout ریشه نشسته و appId را به‌صورت prop از
// سرور می‌گیرد (خواندن env در زمان درخواست — نه موقع بیلد).
//  - appId خالی → هیچ چیزی لود/رندر نمی‌شود (اپ سالم می‌مانَد)
//  - appId تنظیم‌شده → اسکریپت رسمی OneSignal SDK لود می‌شود،
//    init انجام می‌شود و شنوندهٔ تغییرِ اشتراک، subscription ID
//    را برای کاربرِ واردشده در /api/push/subscribe ثبت می‌کند
//
// برای UI تنظیم (فعال/غیرفعال‌کردن یادآور) → PushReminderCard
// که روی /notif نشسته و به رویداد "flex:onesignal-ready" گوش
// می‌دهد (همین فایل پخش می‌کند).
// ========================================

import { useEffect } from "react";

/** زیرمجموعهٔ SDK که استفاده می‌کنیم (تایپِ سبک — خود SDK کامل است) */
export type OneSignalNamespace = {
  init: (options: { appId: string }) => Promise<void>;
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
        await OneSignal.init({ appId });

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
        console.error("[onesignal] init failed:", e);
      }
    });
  }, [appId]);

  // این کامپوننت چیزی رندر نمی‌کند — فقط زیرساخت
  return null;
}
