"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Home,
  BookOpen,
  Pencil,
  Gamepad2,
  Library,
  BarChart3,
  MessageCircle,
  LibraryBig,
  Flame,
} from "lucide-react";
import { useStreak } from "@/app/hook/useStreak";

const menuItems = [
  { label: "داشبورد", icon: Home, href: "/dashboard" },
  { label: "تمرین‌ها", icon: Pencil, href: "/training" },
  { label: "بازی‌ها", icon: Gamepad2, href: "/game" },
  { label: "کتابخانه", icon: LibraryBig, href: "/library" },
  { label: "لغت‌نامه", icon: Library, href: "/vocab" },
  { label: "دوره‌های من", icon: BookOpen, href: "/courses" },
  { label: "عملکرد من", icon: BarChart3, href: "/performance" },
  { label: "پیام‌ها", icon: MessageCircle, href: "/chat" },
];

const iconAnimations: Record<
  string,
  {
    rotate?: number[];
    rotateY?: number[];
    x?: number[];
    scale?: number[];
    y?: number[];
    scaleY?: number[];
    transition: { duration: number; repeat?: number };
  }
> = {
  "/dashboard": { rotate: [0, -15, 15, -10, 0], transition: { duration: 0.5 } },
  "/my-course": { rotateY: [0, 180, 360], transition: { duration: 0.6 } },
  "/training": { x: [0, -3, 3, -2, 0], transition: { duration: 0.4 } },
  "/game": { scale: [1, 1.3, 0.9, 1.15, 1], transition: { duration: 0.5 } },
  "/vocab": { y: [0, -5, 0, -3, 0], transition: { duration: 0.5 } },
  "/performance": {
    scaleY: [1, 1.4, 0.8, 1.2, 1],
    transition: { duration: 0.5 },
  },
  "/chat": { scale: [1, 1.2, 1], transition: { duration: 0.3, repeat: 1 } },
};

function SidebarItem({
  item,
  isActive,
  onClose,
}: {
  item: (typeof menuItems)[0];
  isActive: boolean;
  onClose?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={item.href}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
      `}
    >
      <motion.div
        animate={hovered ? iconAnimations[item.href] : {}}
        className="shrink-0"
      >
        <item.icon size={25} />
      </motion.div>
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { streak } = useStreak();

  // پیام motivitational بر اساس عدد استریک
  const getMessage = () => {
    if (streak.current === 0) return "شروع یک مسیر جدید!";
    if (streak.current < 3) return "فوق‌العاده! داری شروع میکنی";
    if (streak.current < 7) return "عالی! به همین راه ادامه بده";
    if (streak.current < 14) return "آفرین! به مسیرت ادامه بده";
    if (streak.current < 30) return "حرفه‌ای! هر روز تمرین کن";
    return "افسانه‌ای! بیش از یک ماه متوالی!";
  };

  return (
    <div className="h-full bg-white border-l border-slate-100 flex flex-col pt-16 md:pt-0">
      {/* دکمه بستن - فقط موبایل */}
      <div className="md:hidden flex justify-start px-3 py-2 border-b border-slate-100">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-50"
        ></button>
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
            روزهای متوالی یادگیری
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

          <p className="text-sm text-gray-500 mb-1">روز</p>

          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <span>🔥</span>
            <span>{getMessage()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
