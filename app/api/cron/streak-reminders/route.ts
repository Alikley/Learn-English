import { NextRequest, NextResponse } from "next/server";
import { sendStreakReminders } from "@/lib/streak-reminders";
import { isOneSignalConfigured } from "@/lib/onesignal";
import { reportError } from "@/lib/report-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// GET /api/cron/streak-reminders (v1.0.6.7 / English 1.0.1.10)
//
// جابِ روزانهٔ «یادآور استریک»:
//  - فایل vercel.json این مسیر را هر روز ساعت 17:00 UTC
//    (= ۲۰:۳۰ تهران) صدا می‌زند و اگر CRON_SECRET تنظیم شده
//    باشد، به‌صورت «Authorization: Bearer <CRON_SECRET>» می‌فرستد
//  - فراخوانی دستی: curl -H "x-cron-secret: ..." <آدرس>/api/cron/streak-reminders
//  - برای لوکال: crontab یا Task Scheduler، هر روز یک بار
//
// امنیت: بدون CRON_SECRET → 503؛ توکن غلط → 401.
// v1.0.6.7 — 401 حالا «قابل عیب‌یابی» است: طولِ رمزِ دریافتی و
// طولِ CRON_SECRET فعلی در پاسخ هست (بدون لو رفتن هیچ مقداری)
// تا اگر سرتان را کپی/کوتیشن/فاصلهٔ اضافه گذاشته باشید، همان
// لحظه معلوم شود. + در حالت لوکال (تولید نه) پارامتر
// ?secret=... هم پذیرفته می‌شود تا با خود مرورگر تست کنید.
//
// خروجی: جمع‌بندی { checked, eligible, notified, usersNotified, errors }
// ========================================

type SecretInfo = { value: string | null; via: string | null };

function extractSecret(req: NextRequest): SecretInfo {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return { value: authHeader.slice(7).trim(), via: "authorization" };
  }
  const custom = req.headers.get("x-cron-secret");
  if (custom) return { value: custom.trim(), via: "x-cron-secret" };
  // فقط برای تست لوکال (تولید هرگز) — query string در لاگ‌ها می‌ماند
  if (process.env.NODE_ENV !== "production") {
    const q = req.nextUrl.searchParams.get("secret");
    if (q) return { value: q.trim(), via: "query" };
  }
  return { value: null, via: null };
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
    if (provided.value !== expected) {
      // v1.0.6.7 — عیب‌یابی بدون لو رفتن مقدار رمز
      const hint = {
        via: provided.via ?? "هیچ (هدر ارسال نشد)",
        receivedLength: provided.value?.length ?? 0,
        expectedLength: expected.length,
        lengthMatches: (provided.value?.length ?? 0) === expected.length,
      };
      const lengthNote =
        provided.value === null
          ? "هیچ رمزی در هدر نبود"
          : hint.lengthMatches
            ? "طول رمز درست است ولی خود مقدار فرق دارد (دقت کنید: بدون کوتیشن، بدون فاصلهٔ اضافه، حروف بزرگ/کوچک)"
            : `طول رمزِ دریافتی ${hint.receivedLength} است ولی CRON_SECRET فعلی ${hint.expectedLength} کاراکتر است — مقدار را عیناً از .env کپی کنید (بدون کوتیشن/کاما/فاصله)`;
      return NextResponse.json(
        {
          error:
            "رمز جاب نادرست است — اگر آدرس را مستقیم در مرورگر باز کرده‌اید این ۴۰۱ طبیعی است؛ این مسیر فقط با هدر «x-cron-secret» یا «Authorization: Bearer» توسط زمان‌بند صدا زده می‌شود",
          hint: { ...hint, note: lengthNote },
          example: `curl -H "x-cron-secret: <CRON_SECRET>" ${req.nextUrl.origin}/api/cron/streak-reminders`,
          devExample:
            process.env.NODE_ENV !== "production"
              ? `${req.nextUrl.origin}/api/cron/streak-reminders?secret=<CRON_SECRET> (فقط لوکال — باز کنید در مرورگر)`
              : undefined,
        },
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
