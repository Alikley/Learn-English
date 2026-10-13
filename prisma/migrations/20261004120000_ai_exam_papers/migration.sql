-- ========================================
-- برگه‌های امتحانی هوش مصنوعی (v1.0.4.0)
--
-- کش دائمی برگه‌های ساخته‌شده با AI (CodeCraft) از PDF کتاب‌های
-- کمبریج — هر آزمون فقط «یک بار» ساخته می‌شود و برای همیشه
-- همین‌جا ذخیره می‌ماند (صرفه‌جویی در مصرف توکن).
--
-- این مایگریشن idempotent است (مطابق سبک بقیهٔ مایگریشن‌ها)
--  - روی نصب تازه جدول ساخته می‌شود
--  - CREATE TABLE IF NOT EXISTS در اجرای تکراری بی‌اثر است
--
-- بدون اجرای این مایگریشن، سیستم به پارسر قدیمی (heuristic)
-- برمی‌گردد — یعنی سایت بدون این جدول هم کار می‌کند.
-- ========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `IeltsAiPaper` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(48) NOT NULL,
    `bookNumber` INTEGER NOT NULL,
    `testNumber` INTEGER NOT NULL,
    `skill` VARCHAR(16) NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'GENERATING',
    `paperJson` LONGTEXT NULL,
    `keyJson` LONGTEXT NULL,
    `errorMessage` TEXT NULL,
    `model` VARCHAR(64) NULL,
    `generatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IeltsAiPaper_slug_key`(`slug`),
    INDEX `IeltsAiPaper_bookNumber_testNumber_skill_idx`(`bookNumber`, `testNumber`, `skill`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
