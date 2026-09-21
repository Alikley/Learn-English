"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/context/AuthContext";
import { NotificationProvider } from "@/app/context/NotificationContext";
import { LanguageProvider } from "@/app/context/LanguageContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
