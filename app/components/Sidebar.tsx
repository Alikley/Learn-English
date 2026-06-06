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

const Sidebar = () => {
  const pathname = usePathname();

  // اینجا آدرس صفحاتی که ساختی رو وارد کن
  const menuItems = [
    { label: "داشبورد", icon: Home, href: "/dashboard" },
    { label: "دوره‌های من", icon: BookOpen, href: "/my-course" },
    { label: "تمرین‌ها", icon: Pencil, href: "/training" },
    { label: "بازی‌ها", icon: Gamepad2, href: "/game" },
    { label: "لغت‌نامه", icon: Library, href: "/vocab" },
    { label: "عملکرد من", icon: BarChart3, href: "/performance" },
    { label: "پیام‌ها", icon: MessageCircle, href: "/chat" },
  ];

  return (
    <div className="h-[calc(100vh-80px)] p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col">
      {/* منوی اصلی */}
      <nav className="flex-1 space-y-2 mt-2">
        {menuItems.map((item) => {
          // بررسی میکنیم آیا آدرس فعلی با آدرس این دکمه یکی هست؟
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon size={22} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* باکس روزهای متوالی */}
      <div className="mt-auto p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
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
  );
};

export default Sidebar;
