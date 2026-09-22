import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/app/components/AppShell";
import AuthGuard from "@/app/components/AuthGuard";
import { WordHoverProvider } from "@/app/components/vocabulary/WordHoverProvider";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { LanguageProvider } from "@/app/context/LanguageContext";
import Providers from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flex English",
  description: "یادگیری زبان انگلیسی به ساده‌ترین شکل",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// اسکریپت ضدفلش حالت تیره (v1.0.2.0) — قبل از رنگ‌آمیزی صفحه
// کلاس dark را از حافظه مرورگر می‌خواند تا صفحه نپرد
// + زبان انتخابی کاربر (v1.0.1.9) را روی <html> اعمال می‌کند
const themeInitScript = `(function(){try{var t=localStorage.getItem('flex-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}var l=localStorage.getItem('flex-lang');if(l==='en'){document.documentElement.lang='en';document.documentElement.dir='ltr';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full flex flex-col bg-gray-50 dark:bg-[#0b1220] transition-colors duration-300">
        <Providers>
          <ThemeProvider>
            <LanguageProvider>
              <AuthGuard>
                <WordHoverProvider>
                  <AppShell>{children}</AppShell>
                </WordHoverProvider>
              </AuthGuard>
            </LanguageProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
