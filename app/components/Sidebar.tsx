"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Pencil,
  Gamepad2,
  Library,
  BarChart3,
  MessageCircle,
} from "lucide-react";

const menuItems = [
  { label: "داشبورد", icon: Home, href: "/dashboard" },
  { label: "دوره‌های من", icon: BookOpen, href: "/my-course" },
  { label: "تمرین‌ها", icon: Pencil, href: "/training" },
  { label: "بازی‌ها", icon: Gamepad2, href: "/game" },
  { label: "لغت‌نامه", icon: Library, href: "/vocab" },
  { label: "عملکرد من", icon: BarChart3, href: "/performance" },
  { label: "پیام‌ها", icon: MessageCircle, href: "/chat" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full bg-white border-l border-slate-100 flex flex-col">
      <nav className="flex-1 space-y-2 p-3 md:p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon size={22} className="shrink-0" />
              <span className="text-sm md:text-base font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* باکس روزهای متوالی - فقط دسکتاپ */}
      <div className="hidden md:block p-3 md:p-4 border-t border-slate-100">
        <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
          <h3 className="text-xs font-medium text-gray-500 mb-1">
            روزهای متوالی یادگیری
          </h3>
          <div className="text-4xl font-bold text-gray-900 mb-0.5">12</div>
          <p className="text-sm text-gray-500 mb-1">روز</p>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <span>🔥</span>
            <span>آفرین! به مسیرت ادامه بده</span>
          </div>
        </div>
      </div>
    </div>
  );
}
