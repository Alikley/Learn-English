"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/context/AuthContext";
import { NotificationProvider } from "@/app/context/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
