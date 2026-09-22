"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import Cards from "./Cards";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// هدر صفحه اصلی (بازسازی v1.0.2.0)
// - دوزبانه: فارسی / English با جهت درست هر زبان
// - رفع جابه‌جایی تصویر بنر در حالت فارسی (حذف translateX ثابت)
// - انیمیشن ورود نرم برای متن، دکمه و شخصیت (حالت انمیشنی)
// - سازگار با حالت تیره
// ========================================

const CONTENT = {
  fa: {
    heading: ["!خوش آمدید", "flex English", "به"],
    sub: ".یادگیری زبان انگلیسی را به ساده‌ترین و جذاب‌ترین شکل تجربه کنید",
    cta: "ادامه یادگیری",
  },
  en: {
    heading: ["Welcome to", "flex English", "!"],
    sub: "Experience English learning in the simplest and most engaging way.",
    cta: "Keep Learning",
  },
} as const;

export default function MainBox() {
  const { lang, mounted } = useLanguage();
  const current = mounted ? lang : "fa";
  const t = CONTENT[current];

  return (
    <div className="w-full min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors duration-300">
      {/* ================= HERO ================= */}
      <section className="mx-4 md:mx-5 mt-4 md:mt-5 rounded-3xl md:rounded-4xl bg-[#F3F8FF] dark:bg-slate-900 relative overflow-hidden h-auto md:h-70 pb-4 md:pb-0">
        {/* Decorative shapes */}
        <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full bg-blue-200/30 dark:bg-blue-500/10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-200/30 dark:bg-blue-500/10 -translate-x-8 translate-y-8" />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-200/30 dark:bg-blue-500/10 translate-x-8 -translate-y-8" />

        <div className="relative z-10 flex flex-col md:flex-row md:h-70">
          {/* متن — در فارسی سمت راست، در انگلیسی سمت چپ (جهت سند) */}
          <div className="flex-1 flex items-center justify-center mt-2 md:mt-0 order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center md:items-start text-center md:text-start px-2 md:px-6 max-w-[95%]"
            >
              <h1 className="text-[22px] sm:text-[26px] md:text-[44px] leading-snug md:leading-tight font-bold text-slate-900 dark:text-slate-100 wrap-break-word">
                {current === "fa" ? (
                  <>
                    <span>{t.heading[0]}</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {t.heading[1]}
                    </span>{" "}
                    <span>{t.heading[2]}</span>
                  </>
                ) : (
                  <>
                    <span>{t.heading[0]}</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {t.heading[1]}
                    </span>
                    <span>{t.heading[2]}</span>
                  </>
                )}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                className="mt-2 sm:mt-3 text-[14px] sm:text-[16px] md:text-[18px] text-slate-600 dark:text-slate-300 max-w-[90%] md:max-w-xl wrap-break-word"
              >
                {t.sub}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 rounded-2xl bg-blue-600 px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 text-white text-sm md:text-base font-medium shadow-md shadow-blue-600/20 transition hover:bg-blue-700 whitespace-nowrap"
              >
                <ArrowLeft size={18} />
                {t.cta}
              </motion.button>
            </motion.div>
          </div>

          {/* شخصیت — در فارسی سمت چپ، در انگلیسی سمت راست؛ بدون translate ثابت (رفع بنر v1.0.2.0) */}
          <div className="w-full md:w-[34%] flex items-end justify-center shrink-0 order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="w-full flex items-end justify-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full flex items-end justify-center"
              >
                <Image
                  src="/assets/student_image.svg"
                  alt="Student Character"
                  width={485}
                  height={440}
                  priority
                  className="
                    object-contain
                    w-[80%] sm:w-[50%] md:w-full
                    max-h-55 sm:max-h-60 md:max-h-80
                  "
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Cards />
    </div>
  );
}
