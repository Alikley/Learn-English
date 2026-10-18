import type { MetadataRoute } from "next";

// ========================================
// sitemap.xml — v1.0.7.1 (English 1.0.1.14) / گام ۱
//
// قبلاً سایت هیچ sitemap.xml نداشت؛ گوگل/بینگ نمی‌دانستند
// کدام صفحه‌ها هستند و آخرین تغییرشان کِی بوده.
//
// با فایل‌های app/sitemap.ts و app/robots.ts، Next.js
// خودش /sitemap.xml و /robots.txt را می‌سازد (بدون فایل
// استاتیک در public — همیشه همگام با مسیرهای واقعی).
//
// کدام صفحه‌ها می‌آیند؟ فقط صفحه‌های «عمومی» (بدون لاگین
// دیده می‌شوند): لندینگ + صفحه‌های احراز هویت. صفحه‌های
// پشت AuthGuard (dashboard, courses, chat, …) عمداً
// نیستند — هم برای مهمان ریدایرکت می‌شوند (بد برای SEO)
// و هم محتوای خصوصی کاربرها را ندارند که ارزش ایندکس
// عمومی داشته باشد.
//
// آدرس پایه: NEXTAUTH_URL (در Vercel ست شده)؛ اگر نبود
// VERCEL_URL پیش‌نمایش؛ در آخر fallback لوکال — sitemap
// در لوکال هم معتبر می‌ماند تا build وسط راه نپرد.
// ========================================

/** آدرس پایهٔ سایت — بدون / انتهایی */
function siteUrl(): string {
  const fromNextAuth = process.env.NEXTAUTH_URL?.trim();
  if (fromNextAuth) return fromNextAuth.replace(/\/+$/, "");

  const fromVercel = process.env.VERCEL_URL?.trim();
  if (fromVercel) return `https://${fromVercel.replace(/^\/+|\/+$/g, "")}`;

  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  // —— صفحه‌های عمومی سایت ——
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/forgot-password`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/reset-password`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
