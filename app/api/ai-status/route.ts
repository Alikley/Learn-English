import { ok } from "@/lib/api-helpers";
import { cacheStats } from "@/lib/cache";
import { layaStatus } from "@/lib/laya";

// ========================================
// GET /api/ai-status — وضعیت مدل Laya و کش (v1.0.8.0 / English 1.0.2.0)
//
// بعد از راه‌اندازی سرور اختصاصی (راهنما: SERVER-SETUP.md)
// برای اطمینان از اتصال هر دو سرویس:
//   curl https://دامنه-شما/api/ai-status
//
// خروجی (فقط وضعیت — هیچ کلید/URL/مقدار محرمانه‌ای برنمی‌گردد):
//   {
//     laya:  { configured, connected, model, latencyMs, error },
//     redis: { driver, redisConfigured, redisConnected, ... },
//   }
//
// عمومی است چون فقط وضعیت زیرساخت را نشان می‌دهد.
// ========================================

export async function GET() {
  const [laya, redis] = await Promise.all([layaStatus(), cacheStats()]);

  const hint = laya.connected
    ? "مدل Laya وصل است — تعیین سطح از متن نوشتاری و پشتیبان چت هوشمند فعال‌اند"
    : laya.configured
      ? laya.error === "unauthorized"
        ? "LAYA_BASE_URL تنظیم شده ولی کلید LAYA_API_KEY رد شد — کلید سرور را چک کن"
        : "LAYA_BASE_URL تنظیم شده ولی laya-serve پاسخ نمی‌دهد — تعیین سطح فقط از نمرهٔ تست می‌آید و پشتیبانی حالت عمومی دارد"
      : "LAYA_BASE_URL تنظیم نشده — تعیین سطح از نمرهٔ تست کار می‌کند؛ پشتیبان چت هم فعال است (حالت عمومی)";

  return ok({
    laya,
    redis,
    hint,
  });
}
