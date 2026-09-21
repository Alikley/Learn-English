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
// متادیتای ریشه — v1.0.2.0
// قالب عنوان: «صفحه | Flex English» — هر مسیر
// عنوان خودش را از layout همان مسیر می‌گیرد.
// زبان پیش‌فرض فارسی و راست‌چین؛ دکمهٔ زبان در نوبار.
// اسکریپت کوچک زیر (قبل از رنگ‌آمیزی اولیه) کلاس dark را
// از localStorage / ترجیح سیستمی روی <html> می‌گذارد تا
// در حالت تیره فلشِ سفید دیده نشود (همگام با ThemeContext).
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
      /* v1.0.2.0 — اسکریپت تم قبل از هیدریشن کلاس dark می‌گذارد؛
         suppressHydrationWarning جلوی هشدار/بازنشانیِ React را می‌گیرد
         (همان الگوی next-themes) */
      suppressHydrationWarning
      /* v1.0.2.0 — data-scroll-behavior: پیشنهاد خود Next برای اینکه
         هنگام جابه‌جایی بین مسیرها اسکرول نرم لحظه‌ای غیر فعال شود
         و پرش صفحه انیمیشنیِ ناخواسته نباشد */
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-gray-50">
        {/* v1.0.2.0 — اعمال تم قبل از اولین رنگ‌آمیزی (بدون فلش) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('flex-english-theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();",
          }}
        />
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
