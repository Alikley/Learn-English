import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/app/components/AppShell";
import AuthGuard from "@/app/components/AuthGuard";
import { WordHoverProvider } from "@/app/components/vocabulary/WordHoverProvider";
import Providers from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ========================================
// متادیتای ریشه — v1.0.1.9
// قالب عنوان: «صفحه | Flex English» — هر مسیر
// عنوان خودش را از layout همان مسیر می‌گیرد.
// زبان پیش‌فرض فارسی و راست‌چین است؛ با دکمهٔ
// تغییر زبان در نوبار، به‌صورت زنده LTR/انگلیسی
// می‌شود (عنوان تب هم همان لحظه عوض می‌شود).
// ========================================
export const metadata: Metadata = {
  title: {
    default: "Flex English — یادگیری زبان انگلیسی",
    template: "%s | Flex English",
  },
  description: "یادگیری زبان انگلیسی به ساده‌ترین شکل — تمرین، بازی، کتاب و لغت‌نامه",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-gray-50">
        <Providers>
          <AuthGuard>
            <WordHoverProvider>
              <AppShell>{children}</AppShell>
            </WordHoverProvider>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
