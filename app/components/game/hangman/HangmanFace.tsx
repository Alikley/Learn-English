"use client";

import { motion } from "motion/react";

// ========================================
// چهره فیگور هنگ‌من
// با پیشرفت بازی حالت چهره عوض می‌شود:
// خندان → خنثی → نگران → وحشت‌زده → مرده
// ========================================

export type FaceState = "happy" | "neutral" | "worried" | "scared" | "dead";

const WOOD_DARK = "#78350f"; // رنگ خطوط صورت

export default function HangmanFace({
  state,
  cx,
  cy,
}: {
  state: FaceState;
  cx: number;
  cy: number;
}) {
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
