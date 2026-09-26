// ========================================
// پل رسانه‌ای B2 — نسخه ۱.۰.۲.۸
// فایل‌های صوتی و PDF از باکت «خصوصی» B2 از طریق
// این روت سرو می‌شوند:
//   ۱) فقط درخواست‌های از دامنه‌های مجاز پاسخ می‌گیرند
//      (جلوگیری از هات‌لینک و اشتراک لینک)
//   ۲) پاسخ، ریدایرکت ۳۰۲ به لینک «امضادار» است که
//      حداکثر ۷ روز اعتبار دارد
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { isMediaConfigured, signedMediaUrl } from "@/lib/b2-media";

// دامنه‌های مجاز — با متغیر MEDIA_ALLOWED_ORIGINS
// (جدا با کاما) قابل گسترش است
const DEFAULT_ORIGINS = [
  "https://learn-english-wine.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

const ALLOWED_ORIGINS = (
  process.env.MEDIA_ALLOWED_ORIGINS ?? DEFAULT_ORIGINS.join(",")
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** آیا درخواست از خود سایت آمده است؟ (نه از سایت دیگر یا لینک مستقیم) */
function isAllowedMediaRequest(req: NextRequest): boolean {
  // مرورگرهای مدرن این هدر را برای همه درخواست‌ها می‌فرستند؛
  // حتی وقتی افزونه‌ها Referer را حذف کنند این باقی می‌ماند
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "same-site") return true;

  const referer = req.headers.get("referer");
  if (referer) {
    return ALLOWED_ORIGINS.some(
      (o) =>
        referer === o ||
        referer.startsWith(`${o}/`) ||
        referer.startsWith(`${o}?`),
    );
  }

  const origin = req.headers.get("origin");
  if (origin) return ALLOWED_ORIGINS.includes(origin);

  // نه Referer، نه Sec-Fetch-Site → لینک مستقیم/ربات → بلاک
  return false;
}

async function serveMedia(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  if (!isAllowedMediaRequest(req)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!isMediaConfigured()) {
    return new NextResponse(
      "Media storage is not configured (B2_KEY_ID / B2_APP_KEY missing)",
      { status: 503 },
    );
  }

  const { path } = await ctx.params;
  const segments = (path ?? []).filter(
    (s) =>
      s !== "" &&
      s !== "." &&
      s !== ".." &&
      !s.includes("/") &&
      !s.includes("\\") &&
      !s.includes("\0"),
  );
  if (segments.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const remotePath = segments.join("/");
    const url = await signedMediaUrl(remotePath);
    return NextResponse.redirect(url, 302);
  } catch (error) {
    console.error("Media serve error:", error);
    return new NextResponse("Failed to serve media", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return serveMedia(req, ctx);
}

export async function HEAD(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return serveMedia(req, ctx);
}
