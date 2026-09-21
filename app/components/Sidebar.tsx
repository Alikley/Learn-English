"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Transition } from "motion/react";
import {
  Home,
  BookOpen,
  Pencil,
  Gamepad2,
  Library,
  MessageCircle,
  LibraryBig,
  Flame,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useStreak } from "@/app/hook/useStreak";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTheme } from "@/app/context/ThemeContext";

// ========================================
// سایدبار — v1.0.2.1
//
// ✨ v1.0.2.1 (درخواست کاربر — گام ۱):
//  - در حالت ریسپانسیو، نشان استریک و دکمهٔ دارک/لایت
//    از نوبار به این اسلاید کناری منتقل شدند — ردیف
//    «عملیات سریع» بالای منو (فقط موبایل، md:hidden)
//  - دکمهٔ بستنِ اسلاید موبایل آیکون X گرفت (قبلاً خالی بود)
//
// ✨ انیمیشن‌های آیکون‌ها (v1.0.1.9):
//  - هر آیکون هاورِ مخصوص خودش را دارد: بانس،
//    چرخش، فلیپ کتاب، ویگِر قلم، پاپِ پیام...
//  - آیتمِ فعال: «قرص آبی» با انیمیشن shared-layout
//    هنگام جابه‌جایی بین صفحه‌ها می‌لغزد (layoutId)
//  - نوار نشانگر کوچک سمتِ شروع آیتم فعال + نبض
//  - فشردن آیتم: بازخورد فنری whileTap
//
// 🌐 برچسب‌ها از دیکشنری دوزبانه می‌آیند.
// ========================================

type IconAnim = {
  animate: Record<string, number[]>;
  transition: Transition;
};

const iconAnimations: Record<string, IconAnim> = {
  // خانه — بانس شادی‌آمیز با چرخش ظریف
  "/dashboard": {
    animate: { y: [0, -7, 0], rotate: [0, -10, 6, 0], scale: [1, 1.28, 1] },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  // تمرین‌ها — ویگِر نوشتنِ قلم
  "/training": {
    animate: {
      rotate: [0, -16, 11, -7, 0],
      x: [0, -2, 2, -1, 0],
      scale: [1, 1.18, 1],
    },
    transition: { duration: 0.55, ease: "easeInOut" },
  },
  // بازی‌ها — هیجان‌زده تکان می‌خورد
  "/game": {
    animate: {
      rotate: [0, -14, 14, -9, 9, 0],
      scale: [1, 1.32, 0.94, 1.16, 1],
    },
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  // کتابخانه — کتاب ورق می‌خورد (فلیپ سه‌بعدی)
  "/library": {
    animate: { rotateY: [0, 180, 360], scale: [1, 1.22, 1] },
    transition: { duration: 0.65, ease: "easeInOut" },
  },
  // لغت‌نامه — شناور بالا و پایین با چرخش
  "/vocab": {
    animate: { y: [0, -6, 0, -3, 0], rotate: [0, 7, -7, 0], scale: [1, 1.18, 1] },
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  // دوره‌های من — کتاب باز می‌شود (فلیپ محور Y ظریف)
  "/courses": {
    animate: { rotateY: [0, 30, -30, 0], scale: [1, 1.25, 1] },
    transition: { duration: 0.55, ease: "easeInOut" },
  },
  // پیام‌ها — پاپِ دوبل حباب
  "/chat": {
    animate: { scale: [1, 1.38, 0.9, 1.22, 1] },
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function SidebarItem({
  item,
  isActive,
  onClose,
}: {
  item: { labelKey: string; icon: React.ComponentType<{ size?: number }>; href: string };
  isActive: boolean;
  onClose?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { t } = useLanguage();
  const anim = iconAnimations[item.href];

  return (
    <motion.div whileTap={{ scale: 0.97 }} className="relative">
      <Link
        href={item.href}
        onClick={onClose}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 z-10
          ${isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
        `}
      >
        {/* قرص آبیِ آیتم فعال — بین آیتم‌ها می‌لغزد (shared layout) */}
        {isActive && (
          <motion.span
            layoutId="sidebar-active-pill"
            className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}

        {/* نوار نشانگر کوچک آیتم فعال — با نبض آرام */}
        {isActive && (
          <motion.span
            layoutId="sidebar-active-bar"
            className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-blue-500 -z-10"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <motion.span
              className="absolute inset-0 rounded-full bg-blue-400"
              animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.span>
        )}

        <motion.div
          animate={hovered && anim ? anim.animate : {}}
          transition={anim ? anim.transition : undefined}
          className="shrink-0"
        >
          <item.icon size={25} />
        </motion.div>
        <span className="text-sm font-medium">{t(item.labelKey)}</span>
      </Link>
    </motion.div>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { streak } = useStreak();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { labelKey: "sidebar.dashboard", icon: Home, href: "/dashboard" },
    { labelKey: "sidebar.training", icon: Pencil, href: "/training" },
    { labelKey: "sidebar.games", icon: Gamepad2, href: "/game" },
    { labelKey: "sidebar.library", icon: LibraryBig, href: "/library" },
    { labelKey: "sidebar.vocab", icon: Library, href: "/vocab" },
    { labelKey: "sidebar.courses", icon: BookOpen, href: "/courses" },
    { labelKey: "sidebar.chat", icon: MessageCircle, href: "/chat" },
  ];

  // پیام انگیزشی بر اساس عدد استریک
  const getMessageKey = () => {
    if (streak.current === 0) return "sidebar.msg0";
    if (streak.current < 3) return "sidebar.msg1";
    if (streak.current < 7) return "sidebar.msg2";
    if (streak.current < 14) return "sidebar.msg3";
    if (streak.current < 30) return "sidebar.msg4";
    return "sidebar.msg5";
  };

  return (
    <div className="h-full bg-white border-e border-slate-100 flex flex-col pt-16 md:pt-0">
      {/* دکمه بستن - فقط موبایل */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <span className="text-xs font-medium text-gray-400">{t("sidebar.menu")}</span>
        <button
          onClick={onClose}
          aria-label="بستن منو"
          className="p-1.5 rounded-lg hover:bg-slate-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ✅ v1.0.2.1 — ردیف عملیات سریع موبایل:
          نشان استریک + دکمهٔ دارک/لایت (همان‌هایی که در
          ریسپانسیو از نوبار به اینجا منتقل شدند — گام ۱) */}
      <div className="md:hidden flex items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-100">
        {streak.current > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-600">
              {streak.current}
            </span>
            <span className="text-[11px] font-medium text-orange-500">
              {t("sidebar.streakTitle")}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <Flame className="h-4 w-4 text-slate-300" />
            <span className="text-[11px] font-medium text-gray-500">
              {t("sidebar.streakTitle")}
            </span>
          </div>
        )}
        <button
          onClick={toggleTheme}
          title={theme === "light" ? t("navbar.darkMode") : t("navbar.lightMode")}
          className="flex items-center justify-center p-2 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-200 group"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
          ) : (
            <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            onClose={onClose}
          />
        ))}
      </nav>

      {/* ✅ باکس روزهای متوالی — داینامیک */}
      <div className="p-3 border-t border-slate-100">
        <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
          <h3 className="text-xs font-medium text-gray-500 mb-1">
            {t("sidebar.streakTitle")}
          </h3>

          <div className="flex items-center justify-center gap-2 mb-0.5">
            {streak.current > 0 ? (
              <>
                <span className="text-4xl font-bold text-orange-500">
                  {streak.current}
                </span>
                <Flame className="h-6 w-6 text-orange-500" />
              </>
            ) : (
              <span className="text-4xl font-bold text-gray-300">0</span>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-1">{t("sidebar.day")}</p>

          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <span>🔥</span>
            <span>{t(getMessageKey())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
