"use client";

import { motion } from "motion/react";
import { Bot } from "lucide-react";

// ========================================
// نشانگر تایپ سایت — سه نقطهٔ پرنده
// (از ConversationView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 text-white">
        <Bot size={16} />
      </div>
      <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tr-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            animate={{ y: [0, -4, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: d * 0.15,
            }}
            className="w-2 h-2 rounded-full bg-red-400"
          />
        ))}
      </div>
    </motion.div>
  );
}
