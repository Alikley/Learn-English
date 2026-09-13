"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

// ========================================
// کانفتی جشن — برای برد کلمه و پایان دور
// ========================================

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.6 + Math.random() * 1.2,
        color: COLORS[i % COLORS.length],
        w: 5 + Math.random() * 5,
        h: 8 + Math.random() * 6,
        rotate:
          (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
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
