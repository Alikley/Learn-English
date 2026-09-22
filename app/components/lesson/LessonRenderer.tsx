"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useState } from "react";
import { BookX } from "lucide-react";
import { loadLessonContent } from "@/data/lessons";
import type { LessonContent } from "@/data/lessons/types";
import GrammarView from "./views/GrammarView";
import ConversationView from "./views/ConversationView";
import VocabularyView from "./views/VocabularyView";
import ListeningView from "./views/ListeningView";

type Props = {
  slug: string;
  onComplete: (score: number) => void;
  completing: boolean;
};

/**
 * بارگذاری تنبل محتوای درس بر اساس slug و رندر نمای مناسب هر بخش.
 * گرامر / مکالمه / لغات / لیسنینگ — هرکدام نمای اختصاصی خودشان را دارند.
 */
export default function LessonRenderer({
  slug,
  onComplete,
  completing,
}: Props) {
  const { tr, dir } = useLanguage();
  const [content, setContent] = useState<LessonContent | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    loadLessonContent(slug).then((c) => {
      if (!alive) return;
      if (c) setContent(c);
      else setMissing(true);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (missing) {
    return (
      <div
        className="bg-white border border-slate-100 rounded-2xl p-8 text-center space-y-3"
        dir={dir}
      >
        <BookX size={36} className="mx-auto text-slate-300" />
        <p className="text-slate-500 text-sm font-medium">
          {tr("محتوای این درس پیدا نشد", "Lesson content not found")}
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  switch (content.kind) {
    case "grammar":
      return (
        <GrammarView lesson={content} onComplete={onComplete} completing={completing} />
      );
    case "conversation":
      return (
        <ConversationView
          lesson={content}
          onComplete={onComplete}
          completing={completing}
        />
      );
    case "vocabulary":
      return (
        <VocabularyView
          lesson={content}
          onComplete={onComplete}
          completing={completing}
        />
      );
    case "listening":
      return (
        <ListeningView
          lesson={content}
          onComplete={onComplete}
          completing={completing}
        />
      );
    default:
      return null;
  }
}
