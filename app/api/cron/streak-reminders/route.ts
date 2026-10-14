import { NextRequest, NextResponse } from "next/server";
import { sendStreakReminders } from "@/lib/streak-reminders";
import { isOneSignalConfigured } from "@/lib/onesignal";
import { reportError } from "@/lib/report-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// GET /api/cron/streak-reminders (v1.0.6.5 / English 1.0.1.8)
//
// جابِ روزانهٔ «یادآور استریک»:
//  - فایل vercel.json این مسیر را هر روز ساعت 17:00 UTC
//    (= ۲۰:۳۰ تهران) صدا می‌زند و اگر CRON_SECRET تنظیم شده
//    باشد، به‌صورت «Authorization: Bearer <CRON_SECRET>» می‌فرستد
//  - فراخوانی دستی: curl -H "x-cron-secret: ..." <آدرس>/api/cron/streak-reminders
//  - برای لوکال: crontab یا Task Scheduler، هر روز یک بار
//
// امنیت: بدون CRON_SECRET → 503؛ توکن غلط → 401.
// خروجی: جمع‌بندی { checked, eligible, notified, usersNotified, errors }
// ========================================

function extractSecret(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const custom = req.headers.get("x-cron-secret");
  if (custom) return custom.trim();
  return null;
}

async function handle(req: NextRequest) {
  try {
    const expected = process.env.CRON_SECRET?.trim();

    if (!expected) {
      return NextResponse.json(
        {
          error:
            "CRON_SECRET تنظیم نشده — در .env یک رشتهٔ تصادفی بگذارید (مثلاً خروجی openssl rand -hex 16)",
        },
        { status: 503 },
      );
    }

    const provided = extractSecret(req);
    if (provided !== expected) {
      return NextResponse.json(
        { error: "رمز جاب نادرست است" },
        { status: 401 },
      );
    }

    if (!isOneSignalConfigured()) {
      return NextResponse.json(
        {
          error:
            "OneSignal تنظیم نشده — NEXT_PUBLIC_ONESIGNAL_APP_ID و ONESIGNAL_REST_API_KEY را در .env بگذارید",
        },
        { status: 503 },
      );
    }

    const summary = await sendStreakReminders();
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), summary });
  } catch (e) {
    reportError(e, { route: "/api/cron/streak-reminders" });
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

// POST هم پذیرفته می‌شود (برخی زمان‌بند‌ها POST می‌فرستند)
export async function POST(req: NextRequest) {
  return handle(req);
}
