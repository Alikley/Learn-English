"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicPaths = ["/login", "/register"];

export function useIsPublicPath() {
  const pathname = usePathname();
  return publicPaths.some((p) => pathname.startsWith(p));
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!user && !isPublic) router.replace("/login");
    if (user && isPublic) router.replace("/dashboard");
  }, [user, pathname, router, isPublic]);

  return <>{children}</>;
}
