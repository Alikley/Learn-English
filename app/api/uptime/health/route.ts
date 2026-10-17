import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// GET/HEAD /api/uptime/health (v1.0.7.0 / English 1.0.1.13)
//
// 🎯 «نقطهٔ پایش» — این همان آدرسی است که در UptimeRobot ثبت
//    می‌کنید. سرویس بیرونی هر ۵ دقیقه (پلن رایگان) این روت را
//    صدا می‌زند و از کد وضعیت HTTP سلامت سایت را می‌فهمد:
//
//      200 → همه‌چیز سالم (سرور بالا + دیتابیس جواب می‌دهد)
//      503 → سرور بالا است ولی دیتابیس پاسخ نمی‌دهد
//
// طراحی این روت «مخصوص مانیتور» است:
//    - بدون احراز هویت (UptimeRobot کاربر ندارد)
//    - سبک: فقط یک SELECT 1 با بودجهٔ ۳ ثانیه
//    - بدون کش (no-store) تا وضعیت لحظه‌ای برگردد
//    - GET و HEAD هر دو پشتیبانی می‌شوند
//
// منبع راهنما: docs/UPTIME-ROBOT.md
// ========================================

const DB_TIMEOUT_MS = 3_000;

type HealthBody = {
  ok: boolean;
  checks: {
    server: boolean;
    database: boolean;
  };
  uptimeSeconds: number;
  timestamp: string;
  hint?: string;
};

/** یک SELECT 1 با تایم‌اوت — بدون آن، دیتابیسِ خواب‌رفته چک را قفل می‌کند */
async function pingDatabase(): Promise<boolean> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error("timeout")), DB_TIMEOUT_MS),
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

async function handle(): Promise<NextResponse> {
  const dbOk = await pingDatabase();

  const body: HealthBody = {
    ok: dbOk,
    checks: { server: true, database: dbOk },
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    hint: dbOk
      ? undefined
      : "سرور بالا است ولی دیتابیس پاسخ نمی‌دهد — اتصال MySQL را بررسی کنید",
  };

  return NextResponse.json(body, {
    status: dbOk ? 200 : 503,
    headers: { "cache-control": "no-store, max-age=0" },
  });
}

export async function GET() {
  return handle();
}

// برخی ابزارهای پایش HEAD می‌فرستند — همان پاسخ بدون بدنه
export async function HEAD() {
  const res = await handle();
  return new NextResponse(null, {
    status: res.status,
    headers: res.headers,
  });
}
