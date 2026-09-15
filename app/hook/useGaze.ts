"use client";

import { useEffect, useRef, useState } from "react";

// ========================================
// هوک نگاه (Gaze) — چشم‌های کاراکتر موس را دنبال می‌کنند
//
// موقعیت نشانگر موس نسبت به مرکزِ عنصرِ رفرنس‌شده
// به دو عدد نرمال‌شده x و y در بازه ‎-1..1‎ تبدیل می‌شود:
//   x = -1 → نشانگر کاملاً چپ   / x = +1 → کاملاً راست
//   y = -1 → نشانگر بالای سر    / y = +1 → پایین
//
// نکات پیاده‌سازی:
// - رویداد mousemove با requestAnimationFrame تف‌نرخ می‌شود
//   (هر فریم حداکثر یک setState — بدون ری‌رندر اضافه)
// - listener غیرفعال (passive) است و در unmount کامل پاک می‌شود
// - روی دستگاه لمسی رویدادی نمی‌آید؛ چشم‌ها در حالت مرکزی می‌مانند
// ========================================

// شعاع حساسیت — نشانگر در این فاصله (پیکسل) چشم را کاملاً منحرف می‌کند
const RANGE_X = 420;
const RANGE_Y = 320;

export type Gaze = { x: number; y: number };

export function useGaze<T extends HTMLElement>() {
  // رفرنسِ عنصر مرجع (خودِ کاراکتر) — به بیرون داده می‌شود
  const ref = useRef<T | null>(null);
  const [gaze, setGaze] = useState<Gaze>({ x: 0, y: 0 });

  // شناسه فریم در حال اجرا (برای لغو در پاکسازی)
  const rafRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // فاصله نشانگر از مرکز کاراکتر — نرمال و محدود به ‎-1..1‎
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        setGaze({
          x: clamp((e.clientX - centerX) / RANGE_X),
          y: clamp((e.clientY - centerY) / RANGE_Y),
        });
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { ref, gaze };
}
