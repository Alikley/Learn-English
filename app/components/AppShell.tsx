"use client";

import Navbar from "@/app/Navbar";
import Sidebar from "@/app/components/Sidebar";
import StreakLoginAlert from "@/app/components/StreakLoginAlert";
import { NotificationProvider } from "@/app/context/NotificationContext";
import { useIsPublicPath } from "@/app/components/AuthGuard";
import { useSidebar } from "../hook/useSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle } = useSidebar();
  const isPublic = useIsPublicPath();

  // صفحات login و register بدون navbar و sidebar
  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <NotificationProvider>
      <Navbar toggleSidebar={toggle} isOpen={isOpen} />

      {/* ✅ آلرت استریک ورود */}
      <StreakLoginAlert />

      <div className="flex-1 flex flex-row-reverse overflow-hidden h-full relative">
        {/* overlay موبایل */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={toggle}
          />
        )}

        {/* سایدبار */}
        <div
          className={`
            fixed top-0 right-0 h-full z-50 w-56
            transform transition-transform duration-300
            md:static md:translate-x-0 md:w-56 md:shrink-0 md:z-auto
            ${isOpen ? "translate-x-0" : "translate-x-full"}
            md:block
          `}
        >
          <Sidebar onClose={toggle} />
        </div>

        <main className="flex-1 overflow-y-auto h-full">{children}</main>
      </div>
    </NotificationProvider>
  );
}
