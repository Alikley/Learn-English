-- ========================================
-- v1.0.6.9 (English 1.0.1.12)
-- اعلان‌های واقعی کاربر (Notification)
--
-- این مایگریشن idempotent است:
--  - روی نصب تازه جدول ساخته می‌شود
--  - CREATE TABLE IF NOT EXISTS در اجرای تکراری بی‌اثر است
--
-- هر ردیف یک اعلان per-user است که از رویدادهای واقعی
-- سایت ساخته می‌شود (lib/notify.ts) — دوزبانه (fa/en)،
-- با وضعیت خوانده‌شدن و لینک داخلی برای دکمهٔ «مشاهده».
-- ========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `titleFa` VARCHAR(160) NOT NULL,
    `titleEn` VARCHAR(160) NULL,
    `textFa` TEXT NOT NULL,
    `textEn` TEXT NULL,
    `link` VARCHAR(200) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `Notification_userId_isRead_idx` (`userId`, `isRead`),
    INDEX `Notification_userId_createdAt_idx` (`userId`, `createdAt`),
    CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
