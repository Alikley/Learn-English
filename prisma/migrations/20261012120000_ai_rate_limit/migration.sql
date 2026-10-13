-- ========================================
-- سقف مصرف روزانهٔ هوش مصنوعی (v1.0.5.0)
--
-- شمارندهٔ اتمیک (کاربر × روت × روز) برای محافظت از
-- کیف پول: هر کاربر حداکثر N درخواست AI در روز (سقف از
-- env: AI_DAILY_LIMIT_*). «روز» به وقت تهران محاسبه
-- می‌شود — نیمه‌شب تهران شمارنده عملاً صفر می‌شود.
--
-- این مایگریشن idempotent است (مطابق سبک بقیهٔ مایگریشن‌ها)
--  - روی نصب تازه جدول ساخته می‌شود
--  - CREATE TABLE IF NOT EXISTS در اجرای تکراری بی‌اثر است
--
-- بدون این جدول، روت‌های AI مثل قبل کار می‌کنند — فقط
-- سقف روزانه اعمال نمی‌شود (lib/ai-rate-limit خطا را
-- بی‌صدا نادیده می‌گیرد تا سایت هرگز به‌خاطر لیمیت نشکند).
-- ========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `AiUsageCounter` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `route` VARCHAR(32) NOT NULL,
    `day` VARCHAR(10) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AiUsageCounter_userId_route_day_key`(`userId`, `route`, `day`),
    INDEX `AiUsageCounter_userId_day_idx`(`userId`, `day`),
    PRIMARY KEY (`id`),
    CONSTRAINT `AiUsageCounter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
