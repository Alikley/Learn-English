"use client";

import GapInput from "./GapInput";
import BlockView from "./BlockView";
import type { StructGap, StructGroup } from "@/lib/ielts/structured-tests";

// ========================================
// رندر یک گروه سوال (v1.0.4.2)
// سربرگ + دستورهای رسمی + بلاک ساختاری (جدول/لیست/...)
// (از part/[part]/page.tsx جدا شد)
// ========================================

export default function PartGroupView({
  group,
  gapValue,
  setGap,
  answerValue,
  setAnswerFor,
  gapAnswered,
  reviewFlags,
  activeQuestion,
  onFocusQuestion,
  renderChartGap,
}: {
  group: StructGroup;
  gapValue: (gap: StructGap) => string;
  setGap: (gap: StructGap, v: string) => void;
  answerValue: (q: number) => string;
  setAnswerFor: (q: number, v: string) => void;
  gapAnswered: (q: number) => boolean;
  reviewFlags: Record<number, boolean>;
  activeQuestion: number | null;
  onFocusQuestion: (q: number) => void;
  renderChartGap: (q: number) => React.ReactNode;
}) {
  const gapNode = (gap: StructGap) => (
    <GapInput
      id={`input-q-${gap.q}${gap.sub ? `-${gap.sub}` : ""}`}
      q={gap.q}
      sub={gap.sub}
      value={gapValue(gap)}
      answered={gapAnswered(gap.q)}
      flagged={reviewFlags[gap.q] === true}
      active={activeQuestion === gap.q}
      onChange={(v) => setGap(gap, v)}
      onFocus={() => onFocusQuestion(gap.q)}
    />
  );

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 md:p-6 mb-4 shadow-sm">
      <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{group.heading}</h3>
      <div className="mt-1.5 mb-4 space-y-0.5">
        {group.instruction.map((line, i) => (
          <p key={i} className="text-xs leading-6 text-slate-600 dark:text-slate-400">
            {i === group.instruction.length - 1 && group.instruction.length > 1 ? (
              <strong className="font-bold text-slate-700 dark:text-slate-300">{line}</strong>
            ) : (
              line
            )}
          </p>
        ))}
      </div>
      <BlockView
        block={group.block}
        gapNode={gapNode}
        renderChartGap={renderChartGap}
        answerValue={answerValue}
        setAnswerFor={setAnswerFor}
        reviewFlags={reviewFlags}
        onFocusQuestion={onFocusQuestion}
      />
    </section>
  );
}
