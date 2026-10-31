// dump واقعی payload برگه‌ساز برای تست مستقیم با curl (بدون زنجیرهٔ استراتژی)
// خروجی: /tmp/payload.json — همان چیزی که callCodeCraft می‌فرستد
import { getBookPages } from "../lib/ielts/pdf-text";
import {
  sliceTestPages,
  systemPrompt,
  buildUserMessage,
} from "../lib/ielts/ai-paper";

async function main(): Promise<void> {
  const book = Number(process.argv[2] ?? 1);
  const test = Number(process.argv[3] ?? 1);
  const skill = (process.argv[4] ?? "listening") as "reading" | "listening";

  const pages = await getBookPages(book);
  if (!pages.ok) {
    console.error("❌", pages.error);
    process.exit(1);
  }
  const slice = sliceTestPages(pages.pages, test);
  if (!slice) throw new Error("slice null");

  const payload = {
    model: process.env.CODECRAFT_MODEL ?? "deepseek-flash",
    messages: [
      { role: "system", content: systemPrompt(skill) },
      {
        role: "user",
        content: buildUserMessage(book, test, skill, slice.testText, slice.keyText),
      },
    ],
    max_tokens: Number(process.argv[5] ?? 32000),
    temperature: 0,
    stream: true,
    ...(process.env.CODECRAFT_EFFORT ? { effort: process.env.CODECRAFT_EFFORT } : {}),
  };
  const fs = await import("node:fs");
  fs.writeFileSync("/tmp/payload.json", JSON.stringify(payload));
  console.log(
    `payload: ${JSON.stringify(payload).length} نویسه — testText=${slice.testText.length} / keyText=${slice.keyText.length} — model=${payload.model} effort=${process.env.CODECRAFT_EFFORT ?? "(سرویس‌پیش‌فرض)"}`,
  );
}

main().catch((e) => {
  console.error("💥", e);
  process.exit(1);
});
