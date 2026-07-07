"use client";

import { PlayCircle } from "lucide-react";

type Props = {
  title: string;
  text: string;
  explanation?: string;
};

export default function ExampleCard({ title, text, explanation }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <PlayCircle size={18} className="text-blue-500" />
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>

      <p className="text-slate-700 text-sm leading-relaxed">{text}</p>

      {explanation && (
        <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
          {explanation}
        </div>
      )}
    </div>
  );
}
