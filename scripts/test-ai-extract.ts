// تست زندهٔ پایپ‌لاین AI — بدون دیتابیس (فقط توابع خالص)
// اجرا: npx tsx scripts/test-ai-extract.ts [book] [test] [skill]

import { writeFile } from "node:fs/promises";
import { scanCambridge } from "@/lib/b2-cambridge";
import { getBookPages } from "@/lib/ielts/pdf-text";
import {
  sliceTestPages,
  generateAiPaper,
  isAiExamConfigured,
} from "@/lib/ielts/ai-paper";

const bookNumber = Number(process.argv[2] ?? 1);
const testNumber = Number(process.argv[3] ?? 1);
const skill = (process.argv[4] ?? "listening") as "reading" | "listening" | "writing";

console.log("=== AI Extract Pipeline Test ===");
console.log(`book=${bookNumber} test=${testNumber} skill=${skill}`);
console.log(`AI configured: ${isAiExamConfigured()}`);

// ۱) اسکن B2
const scan = await scanCambridge();
console.log("\n--- B2 scan ---");
console.log(`source=${scan.source} bucket=${scan.bucketName} files=${scan.totalFiles}`);
for (const [n, files] of Object.entries(scan.books)) {
  console.log(`  book ${n}: pdf=${files.pdfPath ? "yes" : "NO"} audio=${files.audioFiles.length}`);
}

// ۲) متن PDF
const pages = await getBookPages(bookNumber);
if (!pages.ok) {
  console.error("PDF FAILED:", pages.error);
  process.exit(1);
}
console.log(`\npdf source=${pages.source} pages=${pages.pages.length}`);

// ۳) برش تست
const slice = sliceTestPages(pages.pages, testNumber);
if (!slice) {
  console.error("SLICE FAILED — test not located");
  process.exit(1);
}
console.log(
  `slice: testPages=${slice.testPageCount} testChars=${slice.testText.length} keyPages=${slice.keyPageCount} keyChars=${slice.keyText.length}`,
);

// ۴) تولید با AI
console.log("\n--- calling CodeCraft (may take 1-3 min) ---");
const t0 = Date.now();
const result = await generateAiPaper({
  bookNumber,
  testNumber,
  skill,
  testText: slice.testText,
  keyText: slice.keyText,
});
const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\ngenerated in ${secs}s`);

// ۵) خلاصهٔ نتیجه
const p = result.paper;
if (p.ok) {
  console.log(`\n--- PAPER OK ---`);
  console.log(`sections=${p.sections.length} totalQuestions=${p.totalQuestions}`);
  for (const s of p.sections) {
    const qnums = s.questions.map((q) => q.number);
    console.log(
      `  [${s.title}] range=${s.questionRange ?? "-"} questions=${qnums.length} (${qnums[0]}..${qnums[qnums.length - 1]}) opts=${s.questions.filter((q) => q.options).length} box=${s.optionsBox?.length ?? 0} passage=${s.passageBody ? s.passageBody.length + "ch" : "-"}`,
    );
  }
  if (p.writing) {
    for (const w of p.writing) {
      console.log(`  writing task${w.task}: ${w.prompt.length}ch minWords=${w.minWords}`);
    }
  }
  console.log(`key entries=${result.key ? Object.keys(result.key).length : 0} missing=${result.keyMissing.length}`);
  // نمونه
  if (result.key) {
    const sample = Object.entries(result.key).slice(0, 8);
    console.log("key sample:", JSON.stringify(Object.fromEntries(sample), null, 0));
  }
  const q1 = p.sections[0]?.questions[0];
  if (q1) console.log("q1 sample:", JSON.stringify(q1).slice(0, 200));
  // ذخیرهٔ کامل برای بازبینی
  const out = `ai-paper-${bookNumber}-${testNumber}-${skill}.json`;
  await writeFile(out, JSON.stringify({ paper: p, key: result.key }, null, 2), "utf8");
  console.log(`\nfull JSON saved: ${out}`);
} else {
  console.error("PAPER INVALID");
  process.exit(1);
}
