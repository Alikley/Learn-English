-- ========================================
-- بخش آیلتس (v1.0.3.2)
-- این مایگریشن idempotent است:
--  - روی نصب تازه هر دو جدول ساخته می‌شوند
--  - CREATE TABLE IF NOT EXISTS در اجرای تکراری بی‌اثر است
-- محتوای آزمون‌ها در کد (lib/ielts/content) است؛
-- اینجا فقط تلاش‌ها و پاسخ‌های کاربر ذخیره می‌شود
-- ========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `IeltsAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `testSlug` VARCHAR(40) NOT NULL,
    `skill` VARCHAR(16) NOT NULL,
    `mode` VARCHAR(16) NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'IN_PROGRESS',
    `rawScore` INTEGER NULL,
    `totalQuestions` INTEGER NULL,
    `bandScore` FLOAT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submittedAt` DATETIME(3) NULL,
    `elapsedSec` INTEGER NULL,

    PRIMARY KEY (`id`),
    INDEX `IeltsAttempt_userId_idx` (`userId`),
    INDEX `IeltsAttempt_userId_testSlug_skill_idx` (`userId`, `testSlug`, `skill`),
    INDEX `IeltsAttempt_testSlug_idx` (`testSlug`),
    CONSTRAINT `IeltsAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `IeltsAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `attemptId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(20) NOT NULL,
    `value` TEXT NOT NULL,
    `isCorrect` BOOLEAN NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `IeltsAnswer_attemptId_questionId_key` (`attemptId`, `questionId`),
    INDEX `IeltsAnswer_attemptId_idx` (`attemptId`),
    CONSTRAINT `IeltsAnswer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `IeltsAttempt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
