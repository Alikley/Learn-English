import { ok, err } from "@/lib/api-helpers";
import { getMonitors, isUptimeRobotConfigured } from "@/lib/uptime-robot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// GET /api/uptime/status (v1.0.7.0 / English 1.0.1.13)
//
// وضعیت مانیتورهای UptimeRobot را می‌خواند — برای صفحه/ویجت
// «وضعیت سرویس» یا عیب‌یابی سریع:
//
//   curl https://your-domain.ir/api/uptime/status
//
// خروجی (وقتی کلید تنظیم شده):
//   {
//     configured: true,
//     fetchedAt, monitors: [{
//       id, name, url, state: "up"|"down"|…, stateFa: "فعال"|"قطع"|…,
//       uptimeToday, uptime7d, uptime30d, lastCheckAt }] }
//
// خروجی (کلید خالی): { configured: false, monitors: [], hint }
//   → روت هرگز خطا نمی‌دهد؛ نبودِ کلید یک «وضعیت» است نه خطا.
//
// این روت عمومی است (مثل /api/cache-status): فقط وضعیت
// زیرساخت را نشان می‌دهد — هیچ دادهٔ کاربری یا کلید API
// در پاسخ لو نمی‌رود (کلید فقط در سرور می‌ماند).
//
// نتیجهٔ موفق در lib ۶۰ ثانیه کش می‌شود → حتی با باز شدن
// همزمان توسط کاربرهای زیاد، حداکثر یک درخواست به UptimeRobot
// در دقیقه می‌رود (سقف API: ۱۰ درخواست در دقیقه).
// ========================================

const STATE_FA: Record<string, string> = {
  up: "فعال",
  down: "قطع",
  "seems-down": "احتمالاً قطع",
  paused: "متوقف",
  "not-checked-yet": "هنوز بررسی نشده",
  unknown: "نامشخص",
};

export async function GET() {
  if (!isUptimeRobotConfigured()) {
    return ok({
      configured: false,
      monitors: [],
      hint: "UPTIME_ROBOT_API_KEY در .env تنظیم نشده — docs/UPTIME-ROBOT.md را ببینید",
    });
  }

  const res = await getMonitors();
  if (!res.ok) return err(res.error, 502);

  return ok({
    configured: true,
    fetchedAt: res.data.fetchedAt,
    monitors: res.data.monitors.map((m) => ({
      ...m,
      stateFa: STATE_FA[m.state] ?? m.state,
    })),
    hint: "درصد آپ‌تایم به ترتیب: ۲۴ ساعت / ۷ روز / ۳۰ روز",
  });
}
