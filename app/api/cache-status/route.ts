import { ok } from "@/lib/api-helpers";
import { cacheStats } from "@/lib/cache";

// ========================================
// GET /api/cache-status — وضعیت کش (v1.0.4.6 / English 1.0.0.10)
//
// برای اطمینان از اتصال Redis بعد از دیپلوی:
//   curl https://your-domain/api/cache-status
// خروجی:
//   { ok: true, data: {
//       driver: "redis" | "memory",
//       redisConfigured: boolean,   ← REDIS_URL ست شده؟
//       redisConnected: boolean,    ← واقعاً وصل است؟
//       l1Entries, l2Keys } }
//
// این روت عمومی است چون فقط «وضعیت زیرساخت» را نشان
// می‌دهد و هیچ دادهٔ کاربری ندارد.
// ========================================

export async function GET() {
  const stats = await cacheStats();
  return ok({
    ...stats,
    hint:
      stats.redisConfigured && !stats.redisConnected
        ? "REDIS_URL تنظیم شده ولی Redis پاسخ نمی‌دهد — در حالت حافظه ادامه می‌دهیم"
        : stats.redisConnected
          ? "Redis فعال — کش بین همهٔ instanceها مشترک است"
          : "REDIS_URL تنظیم نشده — کش فقط در حافظهٔ همین سرور است",
  });
}
