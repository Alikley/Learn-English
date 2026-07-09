"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicPaths = ["/login", "/register"];

export function useIsPublicPath() {
  const pathname = usePathname();
  // صفحات عمومی (login, register) و صفحات خواندن کتاب
  if (publicPaths.some((p) => pathname.startsWith(p))) return true;
  // صفحه خواندن کتاب بدون داشبورد
  if (/^\/library\/\d+\/read$/.test(pathname)) return true;
  return false;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = useIsPublicPath();

  useEffect(() => {
    if (!user && !isPublic) router.replace("/login");
    if (user && isPublic && publicPaths.some((p) => pathname.startsWith(p))) {
      router.replace("/dashboard");
    }
  }, [user, pathname, router, isPublic]);

  return <>{children}</>;
}
