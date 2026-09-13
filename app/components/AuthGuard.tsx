"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicPaths = ["/login", "/register"];

// صفحات همیشه عمومی — حتی برای کاربر وارد‌شده هم بدون ریدایرکت باز می‌مانند
const alwaysPublicPaths = ["/downloads"];

export function useIsPublicPath() {
  const pathname = usePathname();
  // صفحات عمومی (login, register) و صفحات خواندن کتاب
  if (publicPaths.some((p) => pathname.startsWith(p))) return true;
  // صفحه خواندن کتاب بدون داشبورد
  if (/^\/library\/\d+\/read$/.test(pathname)) return true;
  // مرکز دانلود — همیشه در دسترس
  if (alwaysPublicPaths.some((p) => pathname.startsWith(p))) return true;
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
    if (user && isPublic && publicPaths.some((p) => pathname.startsWith(p))) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router, isPublic]);

  return <>{children}</>;
}
