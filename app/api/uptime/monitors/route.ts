import { NextRequest, NextResponse } from "next/server";
import {
  createMonitor,
  verifyApiKey,
  clearUptimeCache,
} from "@/lib/uptime-robot";
import { reportError } from "@/lib/report-error";
// v1.0.7.1 (English 1.0.1.14) — پارس بدنه با zod به‌جای دستی
import { validateObject, uptimeMonitorSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// POST /api/uptime/monitors (v1.0.7.0 / English 1.0.1.13)
//
// ساخت مانیتور جدید از داخل پروژه — بدون ورود به داشبورد
// UptimeRobot (اگر UPTIME_ROBOT_WRITE_KEY ست شده باشد).
//
//   curl -X POST https://your-domain.ir/api/uptime/monitors \
//     -H "content-type: application/json" \
//     -H "x-uptime-secret: <UPTIME_ADMIN_SECRET>" \
//     -d '{"url":"https://your-domain.ir/api/uptime/health","name":"Flex English"}'
//
// GET همین مسیر = صحت‌سنجی کلید (تست «کلیدم کار می‌کند؟»).
//
// امنیت: چون ساخت مانیتور کاری «مدیریتی» است و کاربر عادی
// نباید بتواند آن را صدا بزند، این روت با UPTIME_ADMIN_SECRET
// محافظت می‌شود (الگوی همان CRON_SECRET در /api/cron):
//   - UPTIME_ADMIN_SECRET تنظیم نشده → 503 (غیرفعال)
//   - هدر x-uptime-secret غلط → 401
// ========================================

function checkSecret(req: NextRequest): NextResponse | null {
  const expected = process.env.UPTIME_ADMIN_SECRET?.trim();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "UPTIME_ADMIN_SECRET تنظیم نشده — ساخت مانیتور از راه دور غیرفعال است",
      },
      { status: 503 },
    );
  }
  const got =
    req.headers.get("x-uptime-secret")?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? req.nextUrl.searchParams.get("secret")?.trim() || ""
      : "");
  if (got !== expected) {
    return NextResponse.json({ error: "رمز مدیر نامعتبر است" }, { status: 401 });
  }
  return null;
}

/** GET — صحت‌سنجی کلید Read-Only (با همان رمز مدیر) */
export async function GET(req: NextRequest) {
  const denied = checkSecret(req);
  if (denied) return denied;

  const res = await verifyApiKey();
  return NextResponse.json(
    res.ok
      ? {
          ok: true,
          data: res.data,
          hint: "کلید Read-Only UptimeRobot سالم است",
        }
      : { error: res.error },
    { status: res.ok ? 200 : 400 },
  );
}

/** POST — ساخت مانیتور HTTP جدید */
export async function POST(req: NextRequest) {
  const denied = checkSecret(req);
  if (denied) return denied;

  try {
    // بدنهٔ خراب همان پیام قدیمی را می‌دهد؛ بدنهٔ JSON ولی غایب → همان پیام url
    const body = await req.json().catch(() => ({}));
    const parsed = validateObject(uptimeMonitorSchema, body);
    if (!parsed.ok) return parsed.response;
    const url = parsed.data.url;
    const name = parsed.data.name;
    const interval = parsed.data.interval;

    const res = await createMonitor({ url, name, intervalSecs: interval });
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    // مانیتور تازه ساخته شده — کش وضعیت دیگر معتبر نیست
    clearUptimeCache();

    return NextResponse.json(
      {
        ok: true,
        data: res.data,
        hint: `مانیتور ساخته شد — هر ${interval} ثانیه بررسی می‌شود`,
      },
      { status: 201 },
    );
  } catch (ex) {
    reportError(ex, { route: "POST /api/uptime/monitors" });
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}
