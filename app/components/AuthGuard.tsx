"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// صفحات عمومی — ورود و ثبت‌نام
// v1.0.6.5 — /forgot-password و /reset-password هم عمومی شدند
// (بازیابی رمز بدون لاگین باید ممکن باشد؛ /reset-password حتی
// برای کاربرِ واردشده عمومی می‌مانَد تا از لینک ایمیل رمز عوض کند)
const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

// v1.0.5.0 (English 1.0.1.0) — ریشهٔ سایت = لندینگ عمومی:
// بازدیدکنندهٔ جدید بدون لاگین همین‌جا می‌ماند و معرفی سایت را
// می‌بیند؛ کاربرِ واردشده به /home (پنل اصلی) هدایت می‌شود.
const LANDING_PATH = "/";

// v1.0.5.2 (English 1.0.1.2) — رفع باگ «لندینگ بعد از ساخت اکانت»:
// قبلاً کاربرِ واردشده روی login/register با router.replace("/dashboard")
// به داشبورد پرتاب می‌شد که با router.push("/home") در AuthContext مسابقه
// می‌داد و بسته به تایمینگ کاربر جای اشتباه فرود می‌آمد. حالا مقصدِ همهٔ
// مسیرهای عمومی فقط و فقط /home است — همین‌طور که login() و register()
// خودشان آنجا می‌روند؛ یعنی دو ناوبری همیشه هم‌هدف و بدون رقابت.
// (هدایت خودکار صفحهٔ / روی سرور هم انجام می‌شود — app/page.tsx)
const AUTH_HOME_PATH = "/home";

export function useIsPublicPath() {
  const pathname = usePathname();
  // ریشه — دقیقاً "/" (نه startsWith، وگرنه همهٔ مسیرها عمومی می‌شدند!)
  if (pathname === LANDING_PATH) return true;
  // صفحات عمومی (login, register) و صفحات خواندن کتاب
  if (publicPaths.some((p) => pathname.startsWith(p))) return true;
  // صفحه خواندن کتاب بدون داشبورد
  if (/^\/library\/\d+\/read$/.test(pathname)) return true;
  return false;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = useIsPublicPath();

  useEffect(() => {
    // ⚠️ مهم: تا وقتی وضعیت نشست معلوم نشده ریدایرکت نکن
    // (وگرنه رفرش روی صفحه محافظت‌شده کاربر را به /login و بعد /dashboard پرت می‌کند)
    if (isLoading) return;

    if (!user && !isPublic) router.replace("/login");
    // v1.0.5.2 — کاربرِ واردشده روی هر مسیر عمومی (لندینگ، ورود، ثبت‌نام)
    // فقط به /home می‌رود — مقصد واحد، بدون مسابقه با push در AuthContext.
    // (صفحهٔ خواندن کتاب عمومی می‌ماند — خواندن بدون داشبورد مجاز است)
    if (user && isPublic) {
      const isBookRead = /^\/library\/\d+\/read$/.test(pathname);
      // v1.0.6.5 — /reset-password برای کاربرِ واردشده هم می‌مانَد:
      // از لینک ایمیل رمزش را عوض می‌کند (لودینگ مجدد سشن لازم نیست)
      const isResetPassword = pathname.startsWith("/reset-password");
      if (!isBookRead && !isResetPassword) {
        router.replace(AUTH_HOME_PATH);
      }
    }
  }, [user, isLoading, pathname, router, isPublic]);

  return <>{children}</>;
}
