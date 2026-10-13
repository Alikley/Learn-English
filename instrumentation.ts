// ========================================
// instrumentation.ts — نقطهٔ ورود ابزارهای سرور (v1.0.6.0 / English 1.0.1.3)
//
// Next.js این فایل را موقع بوت سرور اجرا می‌کند:
//  - register()        → اینیشیالایز Sentry برای runtime فعلی
//  - onRequestError    → خطاهای سرور کامپوننت‌ها / route handlerها
//                        را خودکار به Sentry می‌فرستد (اگر DSN
//                        تنظیم شده باشد — وگرنه no-op است)
//
// بدون DSN هیچ‌کدام کاری نمی‌کنند — بیلد و بوت مثل قبل سبک می‌ماند.
// ========================================

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
