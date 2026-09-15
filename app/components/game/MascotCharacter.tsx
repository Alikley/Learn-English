"use client";

import { motion } from "motion/react";
import { useGaze } from "@/app/hook/useGaze";
import { useBlink } from "@/app/hook/useBlink";

// ========================================
// کاراکتر انسان متحرک صفحه بازی‌ها — v1.0.0.9
//
// طراحی بر اساس عکس مرجع کاربر: انسان کارتونیِ نمدی
// (موی پشمالو قهوه‌ای، پیراهن سبز زیتونی، بینی گرد بزرگ،
//  چشم‌های درشت، ابروهای پرپشت و لبخند ملایم)
//
// حرکات:
//  - چشم‌ها موس را دنبال می‌کنند (useGaze + فنر نرم)
//  - پلک‌زدن تصادفی طبیعی (useBlink)
//  - سر با پارالاکس ظریف به سمت نشانگر متمایل می‌شود
//  - ابروها با بالا رفتن نشانگر کمی بالا می‌روند
//  - دست راست سلامِ تکان‌تکان‌دهنده می‌دهد (v1.0.0.9)
//  - شناوری آرام + سایهٔ زمینِ هماهنگ با آن (v1.0.0.9)
//  - هالهٔ نرم پشت کاراکتر + کک‌های لپ (v1.0.0.9)
//
// v1.0.0.9 — کاراکتر بزرگ‌تر شد و نیمهٔ چپ صفحه را
//   گرفت (چیدمان ۵۰/۵۰ در هاب بازی‌ها).
//
// منطق در هوک‌هاست؛ این کامپوننت فقط رندر و انیمیشن است.
// پس‌زمینهٔ صفحه تغییری نمی‌کند — هاله بخشی از خودِ
// کاراکتر است، نه پس‌زمینهٔ صفحه.
// ========================================

// ---- یک چشم کامل: سفیدی + عنبیه متحرک + پلک ----
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
      <ellipse cx={cx} cy={cy} rx="25" ry="27" fill="#FFFFFF" />
      <ellipse
        cx={cx}
        cy={cy}
        rx="25"
        ry="27"
        fill="none"
        stroke="#EBBFA0"
        strokeWidth="1.5"
      />

      {/* عنبیه + مردمک + برق چشم — موس را دنبال می‌کند */}
      <motion.g
        animate={{ x: gaze.x * 8, y: gaze.y * 6 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
      >
        <circle cx={cx} cy={cy} r="12" fill="#5D3A1A" />
        {/* هاله روشن عنبیه */}
        <circle cx={cx} cy={cy} r="12" fill="url(#mascot-iris)" />
        <circle cx={cx} cy={cy} r="6" fill="#1F0F05" />
        {/* برق اصلی چشم */}
        <circle cx={cx + 4.5} cy={cy - 5} r="3" fill="#FFFFFF" opacity="0.95" />
        {/* برق ثانویه کوچک */}
        <circle cx={cx - 4} cy={cy + 4} r="1.6" fill="#FFFFFF" opacity="0.5" />
      </motion.g>
    </motion.g>
  );
}

export default function MascotCharacter() {
  // نگاه به سمت موس + پلک‌زدن
  const { ref, gaze } = useGaze<HTMLDivElement>();
  const blinking = useBlink();

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[460px] select-none"
      aria-label="کاراکتر راهنمای بازی‌ها"
      role="img"
    >
      {/* سایهٔ زمین — جایش ثابت می‌ماند و با شناوری کاراکتر نرم نفس می‌کشد */}
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
            {/* پوست صورت — حجم ملایم با گرادیان شعاعی */}
            <radialGradient id="mascot-skin" cx="50%" cy="38%" r="68%">
              <stop offset="0%" stopColor="#FFE7D4" />
              <stop offset="68%" stopColor="#FAD6C1" />
              <stop offset="100%" stopColor="#EFC0A3" />
            </radialGradient>
            {/* بینی بزرگ — نارنجی-هلویی اشباع‌تر */}
            <radialGradient id="mascot-nose" cx="38%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#FFDDB4" />
              <stop offset="55%" stopColor="#F4A460" />
              <stop offset="100%" stopColor="#D9873F" />
            </radialGradient>
            {/* پیراهن زیتونی */}
            <linearGradient id="mascot-shirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C8C49" />
              <stop offset="100%" stopColor="#57662F" />
            </linearGradient>
            {/* برق عنبیه */}
            <radialGradient id="mascot-iris" cx="42%" cy="34%" r="70%">
              <stop offset="0%" stopColor="#8A5B2E" />
              <stop offset="60%" stopColor="#5D3A1A" />
              <stop offset="100%" stopColor="#3E2510" />
            </radialGradient>
            {/* هالهٔ نرم پشت کاراکتر — سبزِ خیلی محو (رنگ سازمانی اپ) */}
            <radialGradient id="mascot-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.95" />
              <stop offset="58%" stopColor="#F0FDFA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ==================== هالهٔ نرم پشت کاراکتر ==================== */}
          <circle cx="150" cy="196" r="146" fill="url(#mascot-halo)" />

          {/* ==================== دست چپِ بیننده — آرام کنار بدن ==================== */}
          {/* قبل از بدن رسم می‌شود تا محل اتصال شانه زیر پیراهن پنهان بماند */}
          <g>
            <path
              d="M84 332 Q 66 356 62 382"
              fill="none"
              stroke="#F2C29E"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <circle cx="62" cy="386" r="12" fill="#F6CDA8" />
            {/* آستین کوتاه پولو */}
            <path
              d="M94 330 Q 80 344 75 358"
              fill="none"
              stroke="#5E6D33"
              strokeWidth="24"
              strokeLinecap="round"
            />
          </g>

          {/* ==================== دست راستِ بیننده — سلام تکان‌تکان‌دهنده ==================== */}
          {/* دور مفصل شانه می‌چرخد؛ با ورود کاراکتر کمی بعد شروع می‌شود */}
          <motion.g
            animate={{ rotate: [0, 16, -6, 16, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
              delay: 0.9,
            }}
            style={{ transformBox: "fill-box", transformOrigin: "24% 89%" }}
          >
            <path
              d="M216 332 Q 248 310 256 276 Q 261 258 259 242"
              fill="none"
              stroke="#F2C29E"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <circle cx="259" cy="238" r="12.5" fill="#F6CDA8" />
            {/* آستین کوتاه پولو */}
            <path
              d="M206 330 Q 236 318 250 298"
              fill="none"
              stroke="#5E6D33"
              strokeWidth="26"
              strokeLinecap="round"
            />
          </motion.g>

          {/* ==================== بدن: پیراهن پولو ==================== */}
          <path
            d="M150 296 C 96 298 62 334 54 400 L 246 400 C 238 334 204 298 150 296 Z"
            fill="url(#mascot-shirt)"
          />
          {/* یقه وی شکل */}
          <path
            d="M126 298 L150 330 L174 298"
            fill="none"
            stroke="#48542A"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* دکمه‌های پولو */}
          <circle cx="150" cy="344" r="4.5" fill="#39431F" />
          <circle cx="150" cy="360" r="4.5" fill="#39431F" />
          {/* درز شانه‌ها */}
          <path
            d="M84 322 C 70 340 62 366 58 392"
            fill="none"
            stroke="#48542A"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.65"
          />
          <path
            d="M216 322 C 230 340 238 366 242 392"
            fill="none"
            stroke="#48542A"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* ==================== گردن ==================== */}
          <rect x="131" y="258" width="38" height="48" rx="17" fill="#F1C4A5" />
          {/* سایه زیر چانه روی گردن */}
          <ellipse cx="150" cy="266" rx="21" ry="8" fill="#DCA87F" opacity="0.7" />

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
            {/* ---- گوش‌های بزرگ C شکل ---- */}
            <ellipse cx="63" cy="180" rx="18" ry="25" fill="#F4C6A5" />
            <ellipse cx="63" cy="180" rx="8.5" ry="13.5" fill="#DFA27B" />
            <ellipse cx="237" cy="180" rx="18" ry="25" fill="#F4C6A5" />
            <ellipse cx="237" cy="180" rx="8.5" ry="13.5" fill="#DFA27B" />

            {/* ---- صورت (شکل تخم‌مرغی نرم) ---- */}
            <path
              d="M150 62 C 208 62 236 108 234 168 C 232 226 196 262 150 262 C 104 262 68 226 66 168 C 64 108 92 62 150 62 Z"
              fill="url(#mascot-skin)"
            />

            {/* ---- موی نمدی: کلاه‌گانه پشمالو ---- */}
            {/* لایه پایه تیره */}
            <path
              d="M150 46 C 98 46 66 88 68 142 C 68 150 71 158 76 162 C 74 122 88 96 106 86 C 122 77 178 77 194 86 C 212 96 226 122 224 162 C 229 158 232 150 232 142 C 234 88 202 46 150 46 Z"
              fill="#6B4423"
            />
            {/* لوله‌های نمدی روی سر */}
            <ellipse
              cx="104"
              cy="88"
              rx="34"
              ry="20"
              transform="rotate(-20 104 88)"
              fill="#8B5A2B"
            />
            <ellipse cx="150" cy="72" rx="38" ry="21" fill="#A0632F" />
            <ellipse
              cx="197"
              cy="88"
              rx="34"
              ry="20"
              transform="rotate(20 197 88)"
              fill="#8B5A2B"
            />
            <ellipse
              cx="126"
              cy="102"
              rx="25"
              ry="15"
              transform="rotate(-8 126 102)"
              fill="#96602E"
            />
            <ellipse
              cx="174"
              cy="102"
              rx="25"
              ry="15"
              transform="rotate(8 174 102)"
              fill="#96602E"
            />
            {/* چتری روی پیشانی */}
            <circle cx="118" cy="115" r="13.5" fill="#96602E" />
            <circle cx="150" cy="111" r="14.5" fill="#A0632F" />
            <circle cx="182" cy="115" r="13.5" fill="#96602E" />
            {/* برق ظریف روی لولهٔ وسط مو */}
            <path
              d="M128 64 Q 150 55 172 64"
              fill="none"
              stroke="#C98F55"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* ---- ابروهای پرپشت — با بالا رفتن نگاه بلند می‌شوند ---- */}
            <motion.g
              animate={{ y: gaze.y * -2.5 }}
              transition={{ type: "spring", stiffness: 160, damping: 15 }}
            >
              <path
                d="M90 133 Q 111 122 132 131"
                stroke="#5D4037"
                strokeWidth="9.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M168 131 Q 189 122 210 133"
                stroke="#5D4037"
                strokeWidth="9.5"
                strokeLinecap="round"
                fill="none"
              />
            </motion.g>

            {/* ---- چشم‌ها — موس را دنبال می‌کنند ---- */}
            <Eye cx={112} cy={164} gaze={gaze} blinking={blinking} />
            <Eye cx={188} cy={164} gaze={gaze} blinking={blinking} />

            {/* ---- بینی گرد و بزرگ ---- */}
            <circle cx="150" cy="197" r="25" fill="url(#mascot-nose)" />
            {/* برق روی بینی */}
            <ellipse cx="141" cy="188" rx="7.5" ry="5" fill="#FFFFFF" opacity="0.4" />

            {/* ---- لپ‌های سرخ ---- */}
            <ellipse cx="89" cy="208" rx="15" ry="8.5" fill="#FF9FAE" opacity="0.5" />
            <ellipse cx="211" cy="208" rx="15" ry="8.5" fill="#FF9FAE" opacity="0.5" />
            {/* کک‌های ظریف روی لپ‌ها */}
            <g fill="#D9986F" opacity="0.5">
              <circle cx="97" cy="200" r="1.7" />
              <circle cx="104" cy="207" r="1.7" />
              <circle cx="96" cy="214" r="1.5" />
              <circle cx="203" cy="200" r="1.7" />
              <circle cx="196" cy="207" r="1.7" />
              <circle cx="204" cy="214" r="1.5" />
            </g>

            {/* ---- لبخند ملایم بسته ---- */}
            <path
              d="M130 237 Q 150 252 170 237"
              stroke="#C97B63"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
