"use client";

import { BookOpen, Lightbulb } from "lucide-react";
import type { WritingTopic } from "@/types/training";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// کارت صورت موضوع نوشتاری + واژه‌های کاربردی
// (از صفحهٔ [topicId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function PromptCard({ topic }: { topic: WritingTopic }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-700 leading-relaxed mb-2" dir="ltr">
            <HoverableText text={topic.prompt} />
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {topic.promptFa}
          </p>
          {/* واژه‌های کاربردی */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {topic.usefulWords.map((w) => (
              <span
                key={w.en}
                className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-full"
                title={w.fa}
              >
                <span dir="ltr">
                  <HoverableText text={w.en} />
                </span>{" "}
                — {w.fa}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
