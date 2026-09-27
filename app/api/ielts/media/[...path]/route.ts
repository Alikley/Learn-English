import { NextRequest, NextResponse } from "next/server";
import { isCambridgeConfigured, scanCambridge, signedCambridgeUrl } from "@/lib/b2-cambridge";

// ========================================
// پل رسانه‌ای B2 — باکت کمبریج (v1.0.3.3)
// PDF و فایل‌های صوتی آزمون‌های آیلتس از باکت
// خصوصی B2 کاربر از طریق این روت سرو می‌شوند:
//   ۱) فقط درخواست‌های از خود سایت پاسخ می‌گیرند
//      (جلوگیری از هات‌لینک — همان الگوی /api/media)
//   ۲) پاسخ، ریدایرکت ۳۰۲ به لینک «امضادار» ۷ روزه است
// مسیر فایل = همان مسیر داخل باکت کمبریج (خروجی اسکن)
// ========================================

// دامنه‌های مجاز — همان پیش‌فرض /api/media؛ با متغیر
// MEDIA_ALLOWED_ORIGINS (جدا با کاما) قابل گسترش است
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

/** آیا درخواست از خود سایت آمده است؟ */
function isAllowedMediaRequest(req: NextRequest): boolean {
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

  return false;
}

async function serveMedia(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  if (!isAllowedMediaRequest(req)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!isCambridgeConfigured()) {
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
    // باکت مقصد از همان اسکن کش‌شده مشخص می‌شود
    const scan = await scanCambridge();
    if (!scan.bucketName) {
      return new NextResponse("Cambridge bucket not found", { status: 503 });
    }

    const remotePath = segments.join("/");
    const url = await signedCambridgeUrl(scan.bucketName, remotePath);
    return NextResponse.redirect(url, 302);
  } catch (error) {
    console.error("IELTS media serve error:", error);
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
