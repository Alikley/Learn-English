"use client";

import { FileText, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import PdfExamPanel from "@/app/components/ielts/PdfExamPanel";

// ========================================
// دکمهٔ شناور + پنل کشویی «کتاب PDF» (v1.0.4.2)
// (از [skill]/page.tsx جدا شد)
// ========================================

export default function PdfDrawer({
  open,
  onOpen,
  onClose,
  pdfUrl,
  bookId,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  pdfUrl: string;
  bookId: number;
}) {
  const { tr } = useLanguage();
  const num = String(bookId).padStart(2, "0");

  return (
    <>
      {/* دکمهٔ شناور */}
      <button
        onClick={onOpen}
        className="fixed bottom-5 end-5 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-bold shadow-xl backdrop-blur hover:scale-[1.03] transition"
      >
        <BookOpen size={15} />
        {tr("کتاب PDF", "Book PDF")}
      </button>

      {/* پنل کشویی */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
            onClick={onClose}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-[560px] h-full bg-[#fbfbfb] dark:bg-[#0b1220] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                  <FileText size={14} className="text-indigo-500" />
                  {tr(`کتاب Cambridge ${num}`, `Cambridge ${num} book`)}
                </p>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 min-h-0 p-3">
                <PdfExamPanel pdfUrl={pdfUrl} bookTitle="Official Book PDF" compact />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
