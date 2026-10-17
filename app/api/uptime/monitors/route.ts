import { NextRequest, NextResponse } from "next/server";
import {
  createMonitor,
  verifyApiKey,
  clearUptimeCache,
} from "@/lib/uptime-robot";
import { reportError } from "@/lib/report-error";

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
    let body: { url?: unknown; name?: unknown; interval?: unknown };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json(
        { error: "درخواست نامعتبر است — بدنهٔ JSON لازم است" },
        { status: 400 },
      );
    }

    const url = typeof body.url === "string" ? body.url.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const interval =
      typeof body.interval === "number" && Number.isFinite(body.interval)
        ? Math.max(300, Math.round(body.interval))
        : 300;

    if (!url) {
      return NextResponse.json(
        { error: "آدرس مانیتور (url) لازم است" },
        { status: 400 },
      );
    }

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
