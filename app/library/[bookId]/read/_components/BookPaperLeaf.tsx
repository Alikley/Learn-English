"use client";

import { motion, AnimatePresence } from "motion/react";
import { BookMarked } from "lucide-react";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// برگهٔ فیزیکی کتاب: لبه‌های برگه‌های بعدی + سایهٔ عطف
// + نوار پیشرفت + محتوای صفحه (متن یا کارت پایان)
// (از صفحهٔ ریدر تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ✅ v1.0.2.۹ — گام ۲: صفحه‌بندی خطی — هر صفحه حداکثر ۶ سطر
// (عنوان فصل خودش یک سطر می‌گیرد)؛ همه صفحه‌ها هم‌اندازه‌اند
// ========================================

export type StoryPage = {
  /** عنوان فصل — بالای برگه (خودش یک سطر می‌گیرد) */
  heading?: string;
  /** خط‌های کتابی این صفحه — حداکثر ۶ سطر */
  lines: string[];
};

export default function BookPaperLeaf({
  page,
  totalPages,
  direction,
  finished,
  currentPage,
  children,
}: {
  page: number;
  totalPages: number;
  direction: 1 | -1;
  finished: boolean;
  currentPage: StoryPage;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* لبه‌های برگه‌های بعدی (حس کتاب فیزیکی) */}
      <div className="absolute inset-y-2 -right-2 left-2 bg-[#EFE6D4] dark:bg-slate-800 rounded-3xl rotate-[0.6deg] shadow-sm" />
      <div className="absolute inset-y-1 -right-1 left-1 bg-[#F5EDDD] dark:bg-slate-800/80 rounded-3xl rotate-[0.3deg] shadow-sm" />

      <div className="relative bg-[#FDF9F0] dark:bg-[#141c2b] rounded-3xl shadow-xl shadow-amber-900/10 dark:shadow-black/40 border border-amber-100/60 dark:border-slate-700/70 overflow-hidden transition-colors duration-300">
        {/* سایه عطف کتاب (سمت راست — کتاب فارسی) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/10 dark:from-black/40 to-transparent" />

        {/* نوار پیشرفت مطالعه */}
        <div className="h-1 bg-amber-100/50 dark:bg-slate-700/50">
          <div
            className="h-full bg-linear-to-l from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 transition-all duration-500"
            style={{
              width: `${((finished ? totalPages : page + 1) / totalPages) * 100}%`,
            }}
          />
        </div>

        {/* ✅ v1.0.2.۹ — گام ۲: ارتفاع برگه متناسب با ۶ سطر —
            همه صفحات هم‌اندازه‌اند؛ اسکرول داخلی فقط حافظِ صفحات عریض موبایل است */}
        <div className="px-6 md:px-14 py-8 md:py-10 h-[27rem] md:h-[31rem] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {finished ? (
              // ---------- کارت پایان کتاب ----------
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center text-center"
              >
                {children}
              </motion.div>
            ) : (
              // ---------- برگه متن ----------
              <motion.div
                key={page}
                custom={direction}
                initial={{ opacity: 0, x: direction * -48, rotateY: 4 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: direction * 48, rotateY: -4 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                /* v1.0.2.۶ — گام ۴: اسکرول داخلی متن */
                className="flex-1 min-h-0 overflow-y-auto"
              >
                {currentPage.heading && (
                  <h2 className="font-serif text-lg md:text-xl font-bold text-amber-900 dark:text-amber-300 mb-4 md:mb-5 flex items-center gap-3">
                    <BookMarked className="h-4 w-4 text-amber-500/70 dark:text-amber-400/70 shrink-0" />
                    <span dir="ltr">{currentPage.heading}</span>
                  </h2>
                )}

                {/* v1.0.2.۹ — گام ۲: خط‌های کتابی — هر خط یک سطر،
                    حداکثر ۶ سطر در هر صفحه */}
                <div dir="ltr" className="space-y-2">
                  {currentPage.lines.map((line, i) => (
                    <p
                      key={i}
                      className="font-serif text-[17px] md:text-[19px] leading-[2] text-slate-800 dark:text-slate-200"
                    >
                      <HoverableText text={line} />
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* شماره برگه */}
          {!finished && (
            <div className="pt-6 mt-2 border-t border-dashed border-amber-200/70 dark:border-slate-700 flex items-center justify-center">
              <span className="font-serif text-xs text-amber-700/70 dark:text-slate-500 tracking-widest">
                — {page + 1} —
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
