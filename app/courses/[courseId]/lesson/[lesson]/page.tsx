"use client";

import ContinueButton from "@/app/components/lesson/ContinueButton";
import ExampleCard from "@/app/components/lesson/ExampleCard";
import LessonHeader from "@/app/components/lesson/LessonHeader";
import { useState } from "react";

export default function LessonPage() {
  const [step, setStep] = useState(0);

  const lesson = {
    title: "Present Continuous (am / is / are + ing)",
    subtitle: "گرامر مبتدی - درس 1",
    xp: 20,
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb]" dir="rtl">
      <LessonHeader
        title={lesson.title}
        subtitle={lesson.subtitle}
        xp={lesson.xp}
        index={0}
      />

      {/* BODY */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* STEP 1 - TEACHING */}
        {step === 0 && (
          <ExampleCard
            title="آموزش"
            text="ما از Present Continuous برای کارهایی استفاده می‌کنیم که الان در حال انجام هستند."
            explanation="ساختار: Subject + am/is/are + verb-ing"
          />
        )}

        {/* STEP 2 - EXAMPLES */}
        {step === 1 && (
          <ExampleCard
            title="مثال"
            text="She is driving to work."
            explanation="یعنی: او الان در حال رانندگی است."
          />
        )}

        {/* STEP 3 - QUESTION */}
        {step === 2 && (
          <ExampleCard
            title="تمرین"
            text="Translate: He is reading a book"
            explanation="پاسخ را حدس بزن"
          />
        )}

        {/* BUTTON */}
        <div className="pt-4">
          <ContinueButton
            onClick={() => setStep((s) => (s < 2 ? s + 1 : 0))}
            label={step < 2 ? "ادامه درس" : "شروع دوباره"}
          />
        </div>
      </div>
    </div>
  );
}
