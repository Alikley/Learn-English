"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Cards from "./Cards";

export default function MainBox() {
  return (
    <div className="w-full min-h-full bg-[#fbfbfb]">
      {/* ================= HERO ================= */}
      <section className="mx-5 mt-5 rounded-4xl bg-[#F3F8FF] relative overflow-hidden h-70">
        {/* Shape Top Left */}
        <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full bg-blue-200/30" />

        {/* Shape Bottom Left */}
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-200/30 -translate-x-8 translate-y-8" />

        {/* Shape Top Right */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-200/30 translate-x-8 -translate-y-8" />

        <div className="relative z-10 flex h-full">
          {/* Character */}
          <div className="w-[35%] flex items-end justify-center">
            <Image
              src="/assets/student_image.svg"
              alt="Student Character"
              width={485}
              height={440}
              priority
              className="object-contain"
              style={{ transform: "translateY(30px)" }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-end text-right">
              <h1 className="text-[48px] leading-none font-bold text-slate-900">
                <span>!خوش آمدید</span>{" "}
                <span className="text-blue-600">flex English</span>{" "}
                <span>به</span>
              </h1>

              <p className="mt-6 text-[20px] text-slate-600">
                .یادگیری زبان انگلیسی را به ساده‌ترین و جذاب‌ترین شکل تجربه کنید
              </p>

              <button className="mt-8 flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-4 text-white font-medium shadow-md transition hover:bg-blue-700">
                <ArrowLeft size={18} />
                ادامه یادگیری
              </button>
            </div>
          </div>
        </div>
      </section>

      <Cards />
    </div>
  );
}
