"use client";

import { CheckCircle2 } from "lucide-react";
import { RiversideVillagePlan, ReasonsMovingChart } from "@/app/components/ielts/part/Diagrams";
import type { StructBlock, StructGap } from "@/lib/ielts/structured-tests";

// ========================================
// رندر یک بلاک ساختاری (v1.0.4.2)
// جدول / لیست / چندگزینه‌ای / تطبیق / نقشه / نمودار — مثل کتاب
// (از part/[part]/page.tsx جدا شد)
// ========================================

export interface BlockViewProps {
  block: StructBlock;
  /** رندر یک جای خالی درون متن (دریافتی از والد) */
  gapNode: (gap: StructGap) => React.ReactNode;
  /** رندر جای خالی درون نمودار */
  renderChartGap: (q: number) => React.ReactNode;
  answerValue: (q: number) => string;
  setAnswerFor: (q: number, v: string) => void;
  reviewFlags: Record<number, boolean>;
  onFocusQuestion: (q: number) => void;
}

/** متن سلول/آیتم که ممکن است چند جای خالی داشته باشد */
function PartsText({
  parts,
  gapNode,
}: {
  parts: (string | StructGap)[];
  gapNode: (gap: StructGap) => React.ReactNode;
}) {
  return (
    <span className="whitespace-pre-line">
      {parts.map((p, pi) =>
        typeof p === "string" ? (
          <span key={pi}>{p}</span>
        ) : (
          <span key={pi} className="inline-block align-middle mx-0.5">
            {gapNode(p)}
          </span>
        ),
      )}
    </span>
  );
}

export default function BlockView({
  block,
  gapNode,
  renderChartGap,
  answerValue,
  setAnswerFor,
  reviewFlags,
  onFocusQuestion,
}: BlockViewProps) {
  switch (block.kind) {
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs" dir="ltr">
            <tbody>
              {block.title && (
                <tr>
                  <th
                    colSpan={4}
                    className="border border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black uppercase tracking-wide px-3 py-2.5 text-center"
                  >
                    {block.title}
                  </th>
                </tr>
              )}
              {block.rows.map((row, ri) => {
                const span = row.cells.reduce((s, c) => s + (c.wide ? row.cells.length : 1), 0);
                return (
                  <tr key={ri}>
                    {row.cells.map((cell, ci) => (
                      <td
                        key={ci}
                        colSpan={cell.wide ? Math.max(2, 4 - span + 1) : undefined}
                        className={`
                          border border-slate-400 dark:border-slate-600 px-3 py-2.5 align-top leading-7
                          ${cell.header ? "bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200" : "text-slate-700 dark:text-slate-300"}
                        `}
                      >
                        <PartsText parts={cell.parts} gapNode={gapNode} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case "list":
      return (
        <div dir="ltr">
          {block.title && (
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-3">
              {block.title}
            </p>
          )}
          <ul className="space-y-2.5">
            {block.items.map((item, i) =>
              "h" in item ? (
                <li key={i} className="text-xs font-black text-slate-700 dark:text-slate-200 pt-2">
                  {item.h}
                </li>
              ) : (
                <li key={i} className="flex gap-2 text-xs leading-7 text-slate-700 dark:text-slate-300">
                  <span className="text-sky-500 shrink-0 mt-0.5">•</span>
                  <PartsText parts={item.parts} gapNode={gapNode} />
                </li>
              ),
            )}
          </ul>
        </div>
      );

    case "mcq":
      return (
        <div dir="ltr" className="space-y-5">
          {block.example && (
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">
                Example
              </p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                {block.example.stem}
              </p>
              <div className="space-y-1.5">
                {block.example.options.map((o) => (
                  <p
                    key={o.letter}
                    className={`
                      text-xs leading-6 px-2 py-1 rounded-lg
                      ${
                        o.letter === block.example?.answer
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      }
                    `}
                  >
                    <strong className="font-black">{o.letter}</strong> &nbsp;{o.text}
                    {o.letter === block.example?.answer && (
                      <CheckCircle2 size={13} className="inline ml-1.5 -mt-0.5 text-emerald-600" />
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}
          {block.items.map((item) => (
            <div key={item.q} id={`q-${item.q}`} className="space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-6">
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-black mr-2 tabular-nums
                    ${
                      reviewFlags[item.q]
                        ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400"
                        : "bg-sky-600 text-white"
                    }
                  `}
                >
                  {item.q}
                </span>
                {item.stem}
              </p>
              <div className="space-y-1.5 ps-4">
                {item.options.map((o) => (
                  <label
                    key={o.letter}
                    className="flex items-start gap-2.5 text-xs leading-6 text-slate-700 dark:text-slate-300 cursor-pointer rounded-lg px-2.5 py-1.5 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition"
                  >
                    <input
                      type="radio"
                      name={`mcq-${item.q}`}
                      checked={answerValue(item.q) === o.letter}
                      onChange={() => {
                        setAnswerFor(item.q, o.letter);
                        onFocusQuestion(item.q);
                      }}
                      className="mt-1 accent-sky-600"
                    />
                    <span>
                      <strong className="font-black text-slate-800 dark:text-slate-100">
                        {o.letter}
                      </strong>
                      &nbsp; {o.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "matching":
      return (
        <div dir="ltr" className="space-y-4">
          {block.prompt && (
            <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">{block.prompt}</p>
          )}
          <div className="space-y-2">
            {block.example && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase w-16">
                  Example
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {block.example.label}:
                </span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black border-2 border-emerald-400">
                  {block.example.answer}
                </span>
              </div>
            )}
            {block.items.map((item) => (
              <div key={item.q} id={`q-${item.q}`} className="flex items-center gap-3 text-xs">
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-black tabular-nums shrink-0
                    ${
                      reviewFlags[item.q]
                        ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }
                  `}
                >
                  {item.q}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200 min-w-[110px]">
                  {item.label}:
                </span>
                <select
                  value={answerValue(item.q)}
                  onChange={(e) => {
                    setAnswerFor(item.q, e.target.value);
                    onFocusQuestion(item.q);
                  }}
                  dir="ltr"
                  className="
                    h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                    text-xs font-black text-slate-700 dark:text-slate-200 outline-none
                    focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/30
                  "
                >
                  <option value="">—</option>
                  {block.options.map((o) => (
                    <option key={o.letter} value={o.letter}>
                      {o.letter} — {o.text}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {/* جعبهٔ گزینه‌ها */}
          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">
              Options
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {block.options.map((o) => (
                <p key={o.letter} className="text-xs leading-6 text-slate-700 dark:text-slate-300">
                  <strong className="font-black">{o.letter}</strong> &nbsp;{o.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      );

    case "plan":
      return (
        <div dir="ltr" className="space-y-4">
          <RiversideVillagePlan />
          <div className="space-y-2 max-w-md">
            {block.labels.map((l, i) => (
              <p key={i} className="text-xs leading-8 text-slate-700 dark:text-slate-300">
                <PartsText parts={l.parts} gapNode={gapNode} />
              </p>
            ))}
          </div>
        </div>
      );

    case "chart":
      return (
        <div dir="ltr" className="space-y-4">
          <ReasonsMovingChart bars={block.bars} renderGap={renderChartGap} />
          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">
              Options
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {block.options.map((o) => (
                <p key={o.letter} className="text-xs leading-6 text-slate-700 dark:text-slate-300">
                  <strong className="font-black">{o.letter}</strong> &nbsp;{o.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      );
  }
}
