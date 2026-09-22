"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";
import HangmanGallows from "./HangmanGallows";
import HangmanFace from "./HangmanFace";
import type { FaceState } from "./HangmanFace";

// ========================================
// فیگور هنگ‌من با انیمیشن
// - دار موقع ورود کشیده می‌شود
// - با هر حدس غلط یک عضو با فنر ظاهر می‌شود
// - کل فیگور با هر اشتباه می‌لرزد
// - حالت چهره با پیشرفت بازی تغییر می‌کند
// - موقع برد فیگور شادی می‌کند (پرش)
// ========================================

export type FigureStatus = "playing" | "won" | "lost";

const BODY = "#475569"; // بدن فیگور
const HEAD_FILL = "#fef9c3"; // صورت

export default function HangmanFigure({
  wrongCount,
  status,
}: {
  wrongCount: number;
  status: FigureStatus;
}) {
  const { tr } = useLanguage();
  const controls = useAnimation();
  const prevWrong = useRef(0);

  // لرزش کل فیگور با هر حدس غلط جدید
  useEffect(() => {
    if (wrongCount > prevWrong.current) {
      controls.start({
        x: [0, -10, 10, -6, 6, -3, 0],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
    }
    prevWrong.current = wrongCount;
  }, [wrongCount, controls]);

  const isLost = status === "lost";
  const isWon = status === "won";

  // موقع باخت فیگور کامل نمایش داده می‌شود
  const parts = isLost ? 6 : wrongCount;

  // حالت چهره بر اساس وضعیت بازی
  const faceState: FaceState = isLost
    ? "dead"
    : isWon || parts === 0
      ? "happy"
      : parts <= 2
        ? "neutral"
        : parts <= 4
          ? "worried"
          : "scared";

  return (
    <motion.div
      animate={controls}
      className="w-full max-w-[250px] mx-auto select-none"
    >
      <svg
        viewBox="0 0 220 260"
        className="w-full h-auto drop-shadow-sm"
        role="img"
        aria-label={tr("فیگور بازی هنگ‌من", "Hangman figure")}
      >
        {/* ============ دار ============ */}
        <HangmanGallows />

        {/* ============ فیگور (موقع برد شادی می‌کند) ============ */}
        <motion.g
          animate={isWon ? { y: [0, -14, 0] } : { y: 0 }}
          transition={
            isWon
              ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        >
          {/* ---- ۱. سر ---- */}
          {parts >= 1 && (
            <motion.g
              key="head"
              initial={{ opacity: 0, scale: 0.2, y: -25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 13 }}
              style={{ transformOrigin: "150px 63px" }}
            >
              <circle
                cx={150}
                cy={63}
                r={16}
                fill={HEAD_FILL}
                stroke="#78350f"
                strokeWidth={3}
              />
              <HangmanFace state={faceState} cx={150} cy={63} />
            </motion.g>
          )}

          {/* ---- ۲. بدن ---- */}
          {parts >= 2 && (
            <motion.line
              key="body"
              x1={150}
              y1={79}
              x2={150}
              y2={135}
              stroke={BODY}
              strokeWidth={4.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* ---- ۳. دست چپ ---- */}
          {parts >= 3 && (
            <motion.line
              key="armL"
              x1={150}
              y1={88}
              x2={124}
              y2={115}
              stroke={BODY}
              strokeWidth={4.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* ---- ۴. دست راست ---- */}
          {parts >= 4 && (
            <motion.line
              key="armR"
              x1={150}
              y1={88}
              x2={176}
              y2={115}
              stroke={BODY}
              strokeWidth={4.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* ---- ۵. پا چپ ---- */}
          {parts >= 5 && (
            <motion.line
              key="legL"
              x1={150}
              y1={135}
              x2={126}
              y2={175}
              stroke={BODY}
              strokeWidth={4.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* ---- ۶. پا راست ---- */}
          {parts >= 6 && (
            <motion.line
              key="legR"
              x1={150}
              y1={135}
              x2={174}
              y2={175}
              stroke={BODY}
              strokeWidth={4.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.g>

        {/* ---- ستاره‌های شادی موقع برد ---- */}
        {isWon && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 1.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path d="M95 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#fbbf24" />
            <path
              d="M185 80 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z"
              fill="#fbbf24"
            />
            <path d="M105 120 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#34d399" />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
