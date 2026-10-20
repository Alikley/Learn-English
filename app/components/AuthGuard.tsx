"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
// v1.0.2.2 — گیت تعیین سطح (گام ۱)
import { usePlacementStatus } from "@/app/hooks/ui/usePlacementStatus";

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

// v1.0.2.2 (English 1.0.2.2) — صفحهٔ تعیین سطح: از گیت معاف است
// (وگرنه کاربر توی حلقهٔ ریدایرکت می‌افتد)؛ بعد از ثبت نتیجه،
// خود صفحه با دکمهٔ «ورود به سایت» او را به /home می‌برد.
const PLACEMENT_PATH = "/placement";

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
  // v1.0.2.2 — سطح کاربر (کش رویدادمحور؛ فقط یک درخواست در طول سشن)
  const placement = usePlacementStatus(user?.id ?? null);

  useEffect(() => {
    // ⚠️ مهم: تا وقتی وضعیت نشست معلوم نشده ریدایرکت نکن
    // (وگرنه رفرش روی صفحه محافظت‌شده کاربر را به /login و بعد /dashboard پرت می‌کند)
    if (isLoading) return;

    // v1.0.8.1 (English 1.0.2.0 hotfix) — مهمانِ رسیده به هر صفحهٔ
    // محافظت‌شده → لندینگ (/) نه صفحهٔ ورود:
    // کاربرِ جدید باید «اول لندینگ» را ببیند (معرفی سایت + ثبت‌نام)؛
    // فرم ورود فقط برای کسی است که خودش دکمهٔ «ورود» را زده — یعنی
    // کسی که اکانت دارد. قبلاً مهمانِ رسیده به /home (مثلاً با باز-
    // گرداندن تبِ مرورگر بعد از ری‌استارت سرور) مستقیم به /login
    // پرتاب می‌شد و تجربهٔ «سایت از لاگین شروع می‌شود» می‌ساخت.
    if (!user && !isPublic) {
      router.replace(LANDING_PATH);
      return;
    }
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
        return;
      }
    }

    // v1.0.2.2 — placement gate (Step 1):
    // a signed-in user with NO placement result is sent to /placement
    // until they finish the assessment — /placement itself is exempt,
    // and the gate stays off unless the status says the system is
    // available (fail-open on DB errors / missing migration).
    if (
      user &&
      !isPublic &&
      pathname !== PLACEMENT_PATH &&
      placement.loaded &&
      placement.available &&
      placement.cefr == null
    ) {
      router.replace(PLACEMENT_PATH);
    }
  }, [user, isLoading, pathname, router, isPublic, placement]);

  return <>{children}</>;
}
