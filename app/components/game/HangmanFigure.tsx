"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";

// ========================================
// فیگور هنگ‌من با انیمیشن
// - دار موقع ورود با انیمیشن pathLength کشیده می‌شود
// - با هر حدس غلط یک عضو با فنر ظاهر می‌شود
// - کل فیگور با هر اشتباه می‌لرزد
// - حالت چهره با پیشرفت بازی تغییر می‌کند
// - موقع برد فیگور شادی می‌کند (پرش)
// ========================================

export type FigureStatus = "playing" | "won" | "lost";

type FaceState = "happy" | "neutral" | "worried" | "scared" | "dead";

// رنگ‌ها
const WOOD = "#b45309"; // دار
const WOOD_DARK = "#78350f"; // طناب و خطوط صورت
const BODY = "#475569"; // بدن فیگور
const HEAD_FILL = "#fef9c3"; // صورت

function Face({ state, cx, cy }: { state: FaceState; cx: number; cy: number }) {
  const lx = cx - 6;
  const rx = cx + 6;
  const ey = cy - 4;

  return (
    <motion.g
      key={state}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {state === "dead" ? (
        <>
          {/* چشم‌های ضربدری */}
          <path
            d={`M${lx - 3} ${ey - 3} L${lx + 3} ${ey + 3} M${lx + 3} ${ey - 3} L${lx - 3} ${ey + 3}`}
            stroke={WOOD_DARK}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d={`M${rx - 3} ${ey - 3} L${rx + 3} ${ey + 3} M${rx + 3} ${ey - 3} L${rx - 3} ${ey + 3}`}
            stroke={WOOD_DARK}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* دهان غمگین */}
          <path
            d={`M${cx - 5} ${cy + 8} Q${cx} ${cy + 4} ${cx + 5} ${cy + 8}`}
            stroke={WOOD_DARK}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : state === "scared" ? (
        <>
          {/* چشم‌های گرد و وحشت‌زده */}
          <circle cx={lx} cy={ey} r={3} fill="#ffffff" stroke={WOOD_DARK} strokeWidth={1.5} />
          <circle cx={rx} cy={ey} r={3} fill="#ffffff" stroke={WOOD_DARK} strokeWidth={1.5} />
          <circle cx={lx} cy={ey} r={1.2} fill={WOOD_DARK} />
          <circle cx={rx} cy={ey} r={1.2} fill={WOOD_DARK} />
          {/* دهان باز */}
          <ellipse cx={cx} cy={cy + 7} rx={3.5} ry={4.5} fill={WOOD_DARK} opacity={0.85} />
        </>
      ) : state === "worried" ? (
        <>
          {/* ابروهای نگران */}
          <path
            d={`M${lx - 3.5} ${ey - 5.5} L${lx + 2.5} ${ey - 3.5}`}
            stroke={WOOD_DARK}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path
            d={`M${rx + 3.5} ${ey - 5.5} L${rx - 2.5} ${ey - 3.5}`}
            stroke={WOOD_DARK}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <circle cx={lx} cy={ey} r={2.2} fill={WOOD_DARK} />
          <circle cx={rx} cy={ey} r={2.2} fill={WOOD_DARK} />
          {/* دهان صاف و نگران */}
          <path
            d={`M${cx - 4} ${cy + 7.5} Q${cx} ${cy + 5.5} ${cx + 4} ${cy + 7.5}`}
            stroke={WOOD_DARK}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : state === "neutral" ? (
        <>
          <circle cx={lx} cy={ey} r={2} fill={WOOD_DARK} />
          <circle cx={rx} cy={ey} r={2} fill={WOOD_DARK} />
          <path
            d={`M${cx - 4.5} ${cy + 7} L${cx + 4.5} ${cy + 7}`}
            stroke={WOOD_DARK}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* چشم‌های خندان */}
          <path
            d={`M${lx - 2.5} ${ey - 1} Q${lx} ${ey - 3.5} ${lx + 2.5} ${ey - 1}`}
            stroke={WOOD_DARK}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M${rx - 2.5} ${ey - 1} Q${rx} ${ey - 3.5} ${rx + 2.5} ${ey - 1}`}
            stroke={WOOD_DARK}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
          {/* لبخند */}
          <path
            d={`M${cx - 5} ${cy + 5.5} Q${cx} ${cy + 10} ${cx + 5} ${cy + 5.5}`}
            stroke={WOOD_DARK}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </motion.g>
  );
}

export default function HangmanFigure({
  wrongCount,
  status,
}: {
  wrongCount: number;
  status: FigureStatus;
}) {
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
        aria-label="فیگور بازی هنگ‌من"
      >
        {/* ============ دار (با انیمیشن رسم شدن) ============ */}
        <motion.line
          x1={25}
          y1={240}
          x2={195}
          y2={240}
          stroke={WOOD}
          strokeWidth={7}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* تیرک عمودی */}
        <motion.line
          x1={55}
          y1={240}
          x2={55}
          y2={25}
          stroke={WOOD}
          strokeWidth={7}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        />
        {/* تیر افقی */}
        <motion.line
          x1={55}
          y1={25}
          x2={150}
          y2={25}
          stroke={WOOD}
          strokeWidth={7}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        {/* مهار مورب */}
        <motion.line
          x1={55}
          y1={60}
          x2={92}
          y2={25}
          stroke={WOOD}
          strokeWidth={5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        />
        {/* طناب */}
        <motion.line
          x1={150}
          y1={25}
          x2={150}
          y2={46}
          stroke={WOOD_DARK}
          strokeWidth={3.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        />

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
                stroke={WOOD_DARK}
                strokeWidth={3}
              />
              <Face state={faceState} cx={150} cy={63} />
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
            <path
              d="M95 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z"
              fill="#fbbf24"
            />
            <path
              d="M185 80 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z"
              fill="#fbbf24"
            />
            <path
              d="M105 120 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z"
              fill="#34d399"
            />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
