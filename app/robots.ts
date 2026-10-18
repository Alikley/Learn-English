import type { MetadataRoute } from "next";

// ========================================
// robots.txt — v1.0.7.1 (English 1.0.1.14) / گام ۱
//
// قواعد خزنده‌ها:
//  - همهٔ صفحه‌های عمومی آزاد
//  - /api/ بسته (خزیدن بی‌معنی + بار بی‌مورد روی دیتابیس)
//  - صفحه‌های خصوصی پشت لاگین بسته (مهمان که می‌رود
//    ریدایرکت می‌شود — ایندکس‌شان فقط «ریدایرکت به لاگین»
//    می‌شد و در نتایج گوگل اسپم می‌ساخت)
//  - در آخر آدرس sitemap.xml اعلام می‌شود تا کشفش فوری باشد
//
// آدرس پایه همان منطق sitemap.ts است (NEXTAUTH_URL →
// VERCEL_URL → لوکال) — با تابع مشترک که اینجا محلی
// تکرار شده تا robots همان منبع حقیقت را ببیند.
// ========================================

function siteUrl(): string {
  const fromNextAuth = process.env.NEXTAUTH_URL?.trim();
  if (fromNextAuth) return fromNextAuth.replace(/\/+$/, "");

  const fromVercel = process.env.VERCEL_URL?.trim();
  if (fromVercel) return `https://${fromVercel.replace(/^\/+|\/+$/g, "")}`;

  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          // صفحه‌های پشت AuthGuard — محتوای خصوصی/ریدایرکت
          "/dashboard",
          "/courses",
          "/chat",
          "/game",
          "/ielts",
          "/library",
          "/training",
          "/vocab",
          "/notif",
          "/home",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
