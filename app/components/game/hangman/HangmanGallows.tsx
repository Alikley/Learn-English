"use client";

import { motion } from "motion/react";

// ========================================
// دار هنگ‌من
// با انیمیشن pathLength مرحله‌به‌مرحله رسم می‌شود
// ========================================

const WOOD = "#b45309"; // چوب دار
const WOOD_DARK = "#78350f"; // طناب

export default function HangmanGallows() {
  return (
    <g>
      {/* کف دار */}
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
    </g>
  );
}
