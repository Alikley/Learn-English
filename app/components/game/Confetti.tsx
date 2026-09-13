"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

// ========================================
// کانفتی جشن — برای برد کلمه و پایان دور
// از شبه‌تصادفی قطعی (seeded) استفاده می‌کنیم
// تا رندر خالص بماند (قانون React Compiler)
// ========================================

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// شبه‌تصادفی قطعی — ورودی یکتا → خروجی پخش‌دار در بازه [0,1)
function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: seededRand(i + 1) * 100,
        delay: seededRand(i + 101) * 0.8,
        duration: 1.6 + seededRand(i + 201) * 1.2,
        color: COLORS[i % COLORS.length],
        w: 5 + seededRand(i + 301) * 5,
        h: 8 + seededRand(i + 401) * 6,
        rotate:
          (seededRand(i + 501) > 0.5 ? 1 : -1) * (360 + seededRand(i + 601) * 360),
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-4%",
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 600, opacity: [0, 1, 1, 0.5], rotate: p.rotate }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            repeat: Infinity,
            repeatDelay: 0.4,
          }}
        />
      ))}
    </div>
  );
}
