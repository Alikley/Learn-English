"use client";

import Navbar from "@/app/Navbar";
import Sidebar from "@/app/components/Sidebar";
import { NotificationProvider } from "@/app/context/NotificationContext";
import { useSidebar } from "../hook/useSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle } = useSidebar();

  return (
    <NotificationProvider>
      <Navbar toggleSidebar={toggle} isOpen={isOpen} />

      <div className="flex-1 flex flex-row-reverse overflow-hidden h-full">
        <div
          className={`
            w-56 md:w-70 h-full shrink-0 bg-transparent transition-all duration-300
            ${isOpen ? "block" : "hidden"}
            md:block
          `}
        >
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto h-full">{children}</main>
      </div>
    </NotificationProvider>
  );
}
