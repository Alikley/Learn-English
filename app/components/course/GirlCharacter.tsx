"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion } from "motion/react";
import { useGaze } from "@/app/hook/ui/useGaze";
import { useBlink } from "@/app/hook/ui/useBlink";

// ========================================
// کاراکتر دختر راهنمای «دوره‌های من» — v1.0.1.3
//
// طبق درخواست کاربر: کاراکتری «مثل صفحه بازی» اما
// این‌بار دختر، با کلاه، و پوست طبیعی‌تر:
//  - کلاه لبه‌پهن کاهی با ربان صورتی + گل کوچک
//  - موی قهوه‌ای بلند که از زیر کلاه روی شانه‌ها می‌ریزد
//  - پوست با گرادیان طبیعیِ کم‌اشباع (نه نارنجی کارتونی)
//  - چشم‌های درشت با مژه — موس را دنبال می‌کنند (useGaze)
//  - پلک‌زدن طبیعی (useBlink) + پارالاکس ظریف سر
//  - دست راستِ سلام‌کننده + شناوری آرام + سایهٔ زمین
//  - هالهٔ نرم سبز (رنگ سازمانی اپ) پشت کاراکتر
//
// منطق در هوک‌هاست؛ این کامپوننت فقط رندر و انیمیشن است.
// ========================================

// ---- یک چشم کامل: سفیدی + عنبیه متحرک + پلک + مژه ----
function Eye({
  cx,
  cy,
  gaze,
  blinking,
}: {
  cx: number;
  cy: number;
  gaze: { x: number; y: number };
  blinking: boolean;
}) {
  return (
    <motion.g
      // پلک‌زدن: جمع‌شدن عمودی چشم حول مرکزش
      animate={{ scaleY: blinking ? 0.06 : 1 }}
      transition={{ duration: 0.09, ease: "easeInOut" }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      {/* سفیدی چشم */}
      <ellipse cx={cx} cy={cy} rx="19" ry="21" fill="#FFFFFF" />
      <ellipse
        cx={cx}
        cy={cy}
        rx="19"
        ry="21"
        fill="none"
        stroke="#E3B28C"
        strokeWidth="1.5"
      />

      {/* عنبیه + مردمک + برق چشم — موس را دنبال می‌کند */}
      <motion.g
        animate={{ x: gaze.x * 7, y: gaze.y * 5 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
      >
        <circle cx={cx} cy={cy} r="10.5" fill="#4A2F23" />
        <circle cx={cx} cy={cy} r="10.5" fill="url(#girl-iris)" />
        <circle cx={cx} cy={cy} r="5.2" fill="#1F0F05" />
        {/* برق اصلی چشم */}
        <circle cx={cx + 4} cy={cy - 4.5} r="2.7" fill="#FFFFFF" opacity="0.95" />
        {/* برق ثانویه کوچک */}
        <circle cx={cx - 3.5} cy={cy + 3.5} r="1.4" fill="#FFFFFF" opacity="0.5" />
      </motion.g>

      {/* مژه‌ها — گوشهٔ بیرونی چشم */}
      <g stroke="#3E2510" strokeWidth="2.2" strokeLinecap="round">
        <line x1={cx - 17} y1={cy - 9} x2={cx - 23} y2={cy - 14} />
        <line x1={cx - 14} y1={cy - 15} x2={cx - 18} y2={cy - 22} />
        <line x1={cx - 8} y1={cy - 19} x2={cx - 10} y2={cy - 26} />
      </g>
    </motion.g>
  );
}

export default function GirlCharacter() {
  const { tr } = useLanguage();
  // نگاه به سمت موس + پلک‌زدن
  const { ref, gaze } = useGaze<HTMLDivElement>();
  const blinking = useBlink();

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[440px] select-none"
      aria-label={tr("کاراکتر راهنمای دوره‌ها", "Courses Guide Character")}
      role="img"
    >
      {/* سایهٔ زمین — با شناوری کاراکتر نرم نفس می‌کشد */}
      <motion.div
        aria-hidden
        className="absolute bottom-[-4px] left-[22%] right-[22%] h-3.5 rounded-[50%] bg-slate-900/10 blur-md"
        initial={{ opacity: 0 }}
        animate={{ scaleX: [1, 0.86, 1], opacity: [0.55, 0.35, 0.55] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      />

      {/* بدن کاراکتر — ورود فنری + شناوری آرام بی‌نهایت */}
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.92 }}
        animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { type: "spring", stiffness: 200, damping: 16 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
        }}
        className="pointer-events-none"
      >
        <svg viewBox="0 0 300 400" className="h-auto w-full drop-shadow-md">
          <defs>
            {/* پوست طبیعی — گرادیان شعاعی کم‌اشباع (نه نارنجی کارتونی) */}
            <radialGradient id="girl-skin" cx="50%" cy="38%" r="68%">
              <stop offset="0%" stopColor="#F8DFC9" />
              <stop offset="66%" stopColor="#F1CBA9" />
              <stop offset="100%" stopColor="#E3B28C" />
            </radialGradient>
            {/* کلاه کاهی */}
            <linearGradient id="girl-hat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EACFA4" />
              <stop offset="100%" stopColor="#D9B87E" />
            </linearGradient>
            <linearGradient id="girl-hat-brim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2C48F" />
              <stop offset="100%" stopColor="#CBA96F" />
            </linearGradient>
            {/* پیراهن سبز-فیروزه‌ای */}
            <linearGradient id="girl-dress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#0E7490" />
            </linearGradient>
            {/* برق عنبیه */}
            <radialGradient id="girl-iris" cx="42%" cy="34%" r="70%">
              <stop offset="0%" stopColor="#6E4630" />
              <stop offset="60%" stopColor="#4A2F23" />
              <stop offset="100%" stopColor="#33200F" />
            </radialGradient>
            {/* هالهٔ نرم پشت کاراکتر — سبزِ محو (رنگ سازمانی اپ) */}
            <radialGradient id="girl-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.95" />
              <stop offset="58%" stopColor="#F0FDFA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ==================== هالهٔ نرم پشت کاراکتر ==================== */}
          <circle cx="150" cy="196" r="146" fill="url(#girl-halo)" />

          {/* ==================== موی پشتی — پشت همه‌چیز ==================== */}
          {/* تودهٔ موی بلند که از زیر کلاه تا پشت شانه‌ها می‌ریزد */}
          <path
            d="M150 92 C 92 92 64 138 66 200 C 67 258 56 300 62 340 Q 74 330 84 340 Q 94 330 104 341 Q 114 331 124 341 Q 134 331 144 341 L 156 341 Q 166 331 176 341 Q 186 331 196 341 Q 206 330 216 340 Q 226 330 238 340 C 244 300 233 258 234 200 C 236 138 208 92 150 92 Z"
            fill="#4A2F23"
          />
          {/* رگه‌های روشن‌تر موی پشتی */}
          <path
            d="M92 130 C 78 180 78 250 84 320"
            fill="none"
            stroke="#5C3A28"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M208 130 C 222 180 222 250 216 320"
            fill="none"
            stroke="#5C3A28"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M150 100 C 142 160 140 240 146 336"
            fill="none"
            stroke="#3A2318"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* ==================== دست چپِ بیننده — آرام کنار بدن ==================== */}
          <g>
            <path
              d="M92 332 Q 74 354 70 378"
              fill="none"
              stroke="#EFC7A8"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <circle cx="70" cy="382" r="10.5" fill="#F2D0B0" />
            {/* آستین پفی کوتاه */}
            <ellipse cx="97" cy="330" rx="17" ry="14" fill="#0F766E" />
          </g>

          {/* ==================== دست راستِ بیننده — سلام تکان‌تکان‌دهنده ==================== */}
          <motion.g
            animate={{ rotate: [0, 16, -6, 16, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
              delay: 0.9,
            }}
            style={{ transformBox: "fill-box", transformOrigin: "26% 88%" }}
          >
            <path
              d="M208 332 Q 238 314 246 282 Q 251 266 249 252"
              fill="none"
              stroke="#EFC7A8"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <circle cx="249" cy="248" r="11" fill="#F2D0B0" />
            {/* آستین پفی کوتاه */}
            <ellipse cx="204" cy="330" rx="18" ry="14" fill="#0F766E" />
          </motion.g>

          {/* ==================== گردن ==================== */}
          <rect x="134" y="250" width="32" height="46" rx="15" fill="#EFC7A8" />
          {/* سایه زیر چانه روی گردن */}
          <ellipse cx="150" cy="258" rx="19" ry="7" fill="#D9A882" opacity="0.55" />

          {/* ==================== بدن: پیراهن آ‌-لاین ==================== */}
          <path
            d="M150 290 C 112 292 88 320 78 400 L 222 400 C 212 320 188 292 150 290 Z"
            fill="url(#girl-dress)"
          />
          {/* یقهٔ سفید دوتکه */}
          <path d="M132 292 L 150 314 L 132 314 Z" fill="#FFFFFF" opacity="0.95" />
          <path d="M168 292 L 150 314 L 168 314 Z" fill="#F8FAFC" opacity="0.95" />
          {/* چین‌های ظریف دامن */}
          <path
            d="M104 352 C 116 360 128 360 140 352"
            fill="none"
            stroke="#0B5E66"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M160 352 C 172 360 184 360 196 352"
            fill="none"
            stroke="#0B5E66"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* ==================== سر — با پارالاکس نگاه ==================== */}
          <motion.g
            animate={{
              x: gaze.x * 5,
              y: gaze.y * 3,
              rotate: gaze.x * 2,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {/* ---- موهای کناری — روی شانه‌ها می‌ریزند ---- */}
            <motion.g
              animate={{ rotate: gaze.x * -1.5 }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
              style={{ transformBox: "fill-box", transformOrigin: "top" }}
            >
              {/* چپ */}
              <path
                d="M80 130 C 60 170 58 250 68 306 Q 76 296 86 306 Q 92 292 102 302 Q 96 240 98 190 Q 96 150 80 130 Z"
                fill="#523324"
              />
              {/* برق موی کناری چپ */}
              <path
                d="M74 160 C 66 210 66 260 72 300"
                fill="none"
                stroke="#6E4630"
                strokeWidth="4.5"
                strokeLinecap="round"
                opacity="0.75"
              />
              {/* راست */}
              <path
                d="M220 130 C 240 170 242 250 232 306 Q 224 296 214 306 Q 208 292 198 302 Q 204 240 202 190 Q 204 150 220 130 Z"
                fill="#523324"
              />
              {/* برق موی کناری راست */}
              <path
                d="M226 160 C 234 210 234 260 228 300"
                fill="none"
                stroke="#6E4630"
                strokeWidth="4.5"
                strokeLinecap="round"
                opacity="0.75"
              />
            </motion.g>

            {/* ---- صورت (شکل تخم‌مرغی نرم) ---- */}
            <path
              d="M150 86 C 198 86 224 124 222 172 C 220 220 192 252 150 252 C 108 252 80 220 78 172 C 76 124 102 86 150 86 Z"
              fill="url(#girl-skin)"
            />

            {/* ---- چتری‌های بیرون‌زده از زیر کلاه ---- */}
            <path
              d="M104 108 C 112 126 124 136 138 132 C 130 122 126 112 124 102 Z"
              fill="#523324"
            />
            <path
              d="M196 108 C 188 126 176 136 162 132 C 170 122 174 112 176 102 Z"
              fill="#523324"
            />
            <path
              d="M138 100 C 144 118 148 126 150 130 C 152 126 156 118 162 100 C 154 106 146 106 138 100 Z"
              fill="#4A2F23"
            />

            {/* ---- ابروهای ظریف — با بالا رفتن نگاه بلند می‌شوند ---- */}
            <motion.g
              animate={{ y: gaze.y * -2.5 }}
              transition={{ type: "spring", stiffness: 160, damping: 15 }}
            >
              <path
                d="M104 152 Q 120 143 136 151"
                stroke="#5D4037"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M164 151 Q 180 143 196 152"
                stroke="#5D4037"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </motion.g>

            {/* ---- چشم‌ها — موس را دنبال می‌کنند + مژه ---- */}
            <Eye cx={120} cy={178} gaze={gaze} blinking={blinking} />
            <Eye cx={180} cy={178} gaze={gaze} blinking={blinking} />

            {/* ---- بینی کوچک و ظریف ---- */}
            <path
              d="M150 192 Q 146 202 151 206"
              stroke="#D9A882"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* ---- لپ‌های صورتی ---- */}
            <ellipse cx="104" cy="208" rx="13" ry="7" fill="#FF9FAE" opacity="0.4" />
            <ellipse cx="196" cy="208" rx="13" ry="7" fill="#FF9FAE" opacity="0.4" />

            {/* ---- لبخند ملایم ---- */}
            <path
              d="M133 226 Q 150 239 167 226"
              stroke="#C97B63"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />

            {/* ==================== کلاه لبه‌پهن کاهی ==================== */}
            {/* لبهٔ کلاه */}
            <ellipse cx="150" cy="104" rx="102" ry="27" fill="url(#girl-hat-brim)" />
            <ellipse cx="150" cy="102" rx="102" ry="26" fill="url(#girl-hat)" />
            {/* تاج کلاه */}
            <path
              d="M102 102 C 102 58 122 40 150 40 C 178 40 198 58 198 102 C 176 112 124 112 102 102 Z"
              fill="url(#girl-hat)"
            />
            {/* بافت ظریف تاج */}
            <path
              d="M110 78 C 130 70 170 70 190 78"
              fill="none"
              stroke="#C9A765"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* ربان صورتی کلاه */}
            <path
              d="M101 96 C 124 110 176 110 199 96 L 199 86 C 176 100 124 100 101 86 Z"
              fill="#FB7185"
            />
            <path
              d="M101 96 C 124 110 176 110 199 96"
              fill="none"
              stroke="#E11D48"
              strokeWidth="3"
              opacity="0.5"
            />
            {/* ---- گل کوچک روی کلاه ---- */}
            <g transform="translate(198 88)">
              <ellipse cx="0" cy="-8" rx="5" ry="7" fill="#FFF7ED" />
              <ellipse
                cx="7.5"
                cy="-2.5"
                rx="5"
                ry="7"
                transform="rotate(72 7.5 -2.5)"
                fill="#FFF7ED"
              />
              <ellipse
                cx="4.5"
                cy="6.5"
                rx="5"
                ry="7"
                transform="rotate(144 4.5 6.5)"
                fill="#FFF7ED"
              />
              <ellipse
                cx="-4.5"
                cy="6.5"
                rx="5"
                ry="7"
                transform="rotate(-144 -4.5 6.5)"
                fill="#FFF7ED"
              />
              <ellipse
                cx="-7.5"
                cy="-2.5"
                rx="5"
                ry="7"
                transform="rotate(-72 -7.5 -2.5)"
                fill="#FFF7ED"
              />
              <circle cx="0" cy="0" r="4" fill="#FBBF24" />
            </g>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
