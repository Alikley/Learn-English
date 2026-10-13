"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// صفحات عمومی — ورود و ثبت‌نام
const publicPaths = ["/login", "/register"];

// v1.0.5.0 (English 1.0.1.0) — ریشهٔ سایت = لندینگ عمومی:
// بازدیدکنندهٔ جدید بدون لاگین همین‌جا می‌ماند و معرفی سایت را
// می‌بیند؛ کاربرِ واردشده به /home (پنل اصلی) هدایت می‌شود.
const LANDING_PATH = "/";

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
    // v1.0.5.0 — کاربرِ واردشده:
    //   روی لندینگ → پنل اصلی (/home)
    //   روی login/register → داشبورد (مثل قبل)
    if (user && isPublic) {
      if (pathname === LANDING_PATH) {
        router.replace("/home");
      } else if (publicPaths.some((p) => pathname.startsWith(p))) {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router, isPublic]);

  return <>{children}</>;
}
