-- ========================================
-- v1.0.6.5 (English 1.0.1.8)
-- بازیابی رمز عبور (PasswordResetToken) +
-- یادآور استریک با پوش OneSignal (PushSubscription)
--
-- این مایگریشن idempotent است:
--  - روی نصب تازه هر دو جدول ساخته می‌شوند
--  - CREATE TABLE IF NOT EXISTS در اجرای تکراری بی‌اثر است
-- ========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE INDEX `PasswordResetToken_tokenHash_key` (`tokenHash`),
    INDEX `PasswordResetToken_userId_idx` (`userId`),
    CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PushSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(128) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `PushSubscription_userId_subscriptionId_key` (`userId`, `subscriptionId`),
    INDEX `PushSubscription_userId_idx` (`userId`),
    CONSTRAINT `PushSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
