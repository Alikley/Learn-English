"use client";

import { ChevronLeft } from "lucide-react";

type Props = {
  loading?: boolean;
  onClick: () => void;
  label?: string;
};

export default function ContinueButton({
  loading,
  onClick,
  label = "ادامه",
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
        w-full
        flex items-center justify-center gap-2
        bg-blue-600 hover:bg-blue-700
        text-white font-semibold
        py-3 rounded-xl
        transition
        disabled:opacity-60
      "
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {label}
          <ChevronLeft size={18} />
        </>
      )}
    </button>
  );
}
