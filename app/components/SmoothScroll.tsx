"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// ========================================
// اسکرول نرم و انیمیشنی کل سایت — v1.0.2.1
//
// Lenis روی <main> (کانتینر اسکرول اپ) سوار می‌شود:
//  - چرخ ماوس/ترک‌پد به‌جای پرش خام، با lerp نرم و
//    انیمیشنی اسکرول می‌شود (درخواست گام ۳)
//  - لمس موبایل دست‌نخورده می‌ماند (syncTouch خاموش —
//    مرورگر خودش اسکرول لِخت با مومنتوم دارد)
//  - allowNestedScroll: نواحی اسکرول داخلی (متن گفتگو،
//    دیالوگ لغت، ادیتور نوشتن و ...) خودشان اسکرول
//    می‌خورند؛ data-lenis-prevent هم در CSS پشتیبان است
//  - جابه‌جایی بین مسیرها: نمونه از نو ساخته می‌شود
//    (المان محتوای صفحه عوض می‌شود) و اسکرول به بالای
//    صفحهٔ جدید می‌رود (رفتار استاندارد SPA)
//  - prefers-reduced-motion کاربر محترم شمرده می‌شود
//    (پیش‌فرض خود lenis)
//  - اگر init شکست بخورد، اسکرول بومی سالم می‌ماند
// ========================================

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        wrapper: main as HTMLElement,
        content:
          (main.firstElementChild as HTMLElement | null) ??
          (main as HTMLElement),
        // بدون duration مشخص، lerp پیش‌فرض 0.1 اعمال می‌شود —
        // همان حس اسکرول نرم و باکیفیتِ پیش‌فرض lenis
        smoothWheel: true,
        allowNestedScroll: true,
        autoRaf: true,
      });
    } catch {
      // شروع ناموفق lenis → اسکرول بومی بدون مشکل کار می‌کند
      return;
    }

    // مسیر جدید = صفحهٔ جدید از بالا
    lenis.scrollTo(0, { immediate: true });

    return () => {
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}
