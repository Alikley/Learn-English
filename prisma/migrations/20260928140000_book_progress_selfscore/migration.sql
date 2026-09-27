-- ========================================
-- v1.0.3.3 — گام ۴ (پیشرفت مطالعه) + خودتصحیحی آیلتس
-- این مایگریشن idempotent است:
--  ۱) جدول BookProgress با CREATE TABLE IF NOT EXISTS
--  ۲) ستون selfScored با بررسی information_schema
--     (سازگار با MySQL و MariaDB — بدون ADD COLUMN IF NOT EXISTS)
-- ========================================

-- CreateTable (پیشرفت مطالعهٔ کتاب)
CREATE TABLE IF NOT EXISTS `BookProgress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bookId` INTEGER NOT NULL,
    `page` INTEGER NOT NULL DEFAULT 0,
    `totalPages` INTEGER NOT NULL DEFAULT 0,
    `finished` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `BookProgress_userId_idx` (`userId`),
    UNIQUE INDEX `BookProgress_userId_bookId_key` (`userId`, `bookId`),
    CONSTRAINT `BookProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `BookProgress_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddColumn (خودتصحیحی آیلتس) — فقط اگر از قبل وجود نداشته باشد
SET @has_selfscored = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'IeltsAttempt'
      AND COLUMN_NAME = 'selfScored'
);
SET @ddl_selfscored = IF(
    @has_selfscored = 0,
    'ALTER TABLE `IeltsAttempt` ADD COLUMN `selfScored` BOOLEAN NULL',
    'SELECT 1'
);
PREPARE stmt FROM @ddl_selfscored;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
