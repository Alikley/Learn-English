"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/context/AuthContext";

// v1.0.6.9 — NotificationProvider از اینجا حذف و به AppShell منتقل شد:
// اعلان‌ها فقط مال اپ خصوصی‌اند (صفحات عمومی مثل login/register
// نیازی به واکشی ندارند) و Provider باید داخل LanguageProvider
// باشد تا متن اعلان‌ها با تغییر زبان سایت (fa/en) عوض شود.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
