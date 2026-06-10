import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Cards from "./Cards";

export default function MainBox() {
  return (
    <div className="w-full min-h-full bg-[#fbfbfb]">
      {/* ================= HERO ================= */}
      <section className="mx-4 md:mx-5 mt-4 md:mt-5 rounded-3xl md:rounded-4xl bg-[#F3F8FF] relative overflow-hidden h-auto md:h-[280px] pb-4 md:pb-0">
        {/* Decorative shapes */}
        <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full bg-blue-200/30" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-200/30 -translate-x-8 translate-y-8" />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-200/30 translate-x-8 -translate-y-8" />

        <div className="relative z-10 flex flex-col md:flex-row md:h-[280px]">
          {/* Character */}
          <div className="w-full md:w-[32%] flex items-end justify-center shrink-0">
            {/* موبایل: عکس نرمال بدون translate */}
            <Image
              src="/assets/student_image.svg"
              alt="Student Character"
              width={485}
              height={440}
              priority
              className="
                object-contain block md:hidden
                w-[80%] sm:w-[50%]
                max-h-[220px] sm:max-h-[240px]
              "
              style={{ transform: "translateX(20px) translateY(0px)" }}

            />
            {/* دسکتاپ: عکس با translate اصلی */}
            <Image
              src="/assets/student_image.svg"
              alt="Student Character"
              width={485}
              height={440}
              priority
              className="object-contain hidden md:block w-full max-h-89.5"
              style={{ transform: "translateX(200px) translateY(50px)" }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center mt-2 md:mt-0">
            <div className="flex flex-col items-center md:items-end text-center md:text-right px-2 md:px-0 max-w-[95%]">
              <h1 className="text-[22px] sm:text-[26px] md:text-[48px] leading-snug md:leading-none font-bold text-slate-900 wrap-break-word">
                <span>!خوش آمدید</span>{" "}
                <span className="text-blue-600">flex English</span>{" "}
                <span>به</span>
              </h1>
              <p className="mt-2 sm:mt-3 text-[14px] sm:text-[16px] md:text-[20px] text-slate-600 max-w-[90%] md:max-w-xl wrap-break-word">
                .یادگیری زبان انگلیسی را به ساده‌ترین و جذاب‌ترین شکل تجربه کنید
              </p>
              <button className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 rounded-2xl bg-blue-600 px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 text-white text-sm md:text-base font-medium shadow-md transition hover:bg-blue-700 whitespace-nowrap">
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
