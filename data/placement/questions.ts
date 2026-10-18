// ========================================
// سوال‌های تست تعیین سطح (v1.0.8.0 / English 1.0.2.0)
// ⚠️ فقط سمت سرور — جواب‌های درست هرگز به کلاینت فرستاده
//    نمی‌شوند (GET /api/placement فقط متن سوال‌ها را می‌دهد)
//
// ۸ سوال چهارگزینه‌ای با سختی صعودی A1 → C1
// (گرامر + واژگان — همان نقاط سنجش کلاسیک placement)
// + یک بخش نوشتاری اختیاری که متنش به مدل Laya داده
//   می‌شود تا سطح واقعی نوشتن زبان‌آموز طبقه‌بندی شود.
// ========================================

export type PlacementCefr = "A1" | "A2" | "B1" | "B2" | "C1";

export type PlacementQuestion = {
  id: string;
  /** سطحی که این سوال می‌سنجد */
  cefr: PlacementCefr;
  /** متن سوال */
  prompt: string;
  options: string[];
  /** ایندکس جواب درست — فقط سمت سرور */
  correctIndex: number;
};

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "q1",
    cefr: "A1",
    prompt: "She ___ a teacher.",
    options: ["am", "is", "are", "be"],
    correctIndex: 1,
  },
  {
    id: "q2",
    cefr: "A1",
    prompt: "What ___ your name?",
    options: ["is", "are", "am", "be"],
    correctIndex: 0,
  },
  {
    id: "q3",
    cefr: "A2",
    prompt: "Yesterday we ___ to the cinema.",
    options: ["go", "goes", "went", "gone"],
    correctIndex: 2,
  },
  {
    id: "q4",
    cefr: "A2",
    prompt: "I'm looking forward ___ you again.",
    options: ["to see", "to seeing", "for seeing", "seeing"],
    correctIndex: 1,
  },
  {
    id: "q5",
    cefr: "B1",
    prompt: "If I ___ more time, I would travel more.",
    options: ["have", "had", "will have", "would have"],
    correctIndex: 1,
  },
  {
    id: "q6",
    cefr: "B1",
    prompt: "The report needs ___ before Friday.",
    options: ["to finish", "finishing", "finish", "finished"],
    correctIndex: 1,
  },
  {
    id: "q7",
    cefr: "B2",
    prompt: "Rarely ___ such a beautiful sunset.",
    options: ["I have seen", "have I seen", "I saw", "did I saw"],
    correctIndex: 1,
  },
  {
    id: "q8",
    cefr: "C1",
    prompt: "Not until the results were announced ___ the gravity of the situation.",
    options: ["he realized", "did he realize", "he did realize", "realized he"],
    correctIndex: 1,
  },
];

/** شرح سطح برای مدل Laya — سوال choice روی متن نوشتاری کاربر */
export const WRITING_LEVEL_CRITERIA: Record<PlacementCefr, string> = {
  A1: "very basic isolated words and phrases, frequent grammatical errors, only simple present, very short",
  A2: "simple disconnected sentences on everyday topics, basic connectors, noticeable errors but understandable",
  B1: "connected text on familiar topics, reasonable control of grammar, some complex structures with errors",
  B2: "clear detailed text, good range of vocabulary and structures, only minor errors",
  C1: "fluent well-structured text, complex grammatical structures, precise vocabulary, natural style",
};

export const WRITING_INSTRUCTIONS =
  "What CEFR English level does this writer demonstrate? Judge grammar, vocabulary range, and text structure.";
