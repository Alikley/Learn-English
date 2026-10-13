import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

// ========================================
// پیکربندی Vitest (v1.0.6.0 / English 1.0.1.3)
//
// - alias @ مثل خود اپ (tsconfig paths) → ریشهٔ پروژه
// - environment: node — تست‌ها منطق سرور را با prisma/next-auth
//   ماک‌شده اجرا می‌کنند (بدون دیتابیس واقعی → در CI هم سبک است)
// - اجرا: npm test (vitest run) / npm run test:watch
// ========================================

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // گزارش فشرده برای CI
    reporters: ["default"],
  },
});
