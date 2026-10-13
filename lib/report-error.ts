import * as Sentry from "@sentry/nextjs";

// ========================================
// گزارش خطای یکجا — لاگ سرور + Sentry (v1.0.6.0 / English 1.0.1.3)
//
// الگوی استفاده در route handlerها (به جای console.error تنها):
//
//   } catch (e) {
//     reportError(e, { route: "/api/game/memory/result", userId });
//     return err("خطا در ثبت نتیجه", 500);
//   }
//
// رفتار:
//  - همیشه در لاگ سرور چاپ می‌شود (مثل قبل)
//  - اگر SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN تنظیم شده باشد،
//    همزمان با context به Sentry پروداکشن هم می‌رود
//  - خطای خودِ گزارش‌دهی هرگز مسیر اصلی را نمی‌شکند
// ========================================

export function reportError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (context && Object.keys(context).length > 0) {
    console.error("[error]", context, error);
  } else {
    console.error("[error]", error);
  }

  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    try {
      Sentry.captureException(
        error,
        context ? { extra: context } : undefined,
      );
    } catch {
      // no-op — خودِ گزارش خطا نباید اکسپشن جدید بسازد
    }
  }
}
