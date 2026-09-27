-- ========================================
-- چت کاربران (v1.0.3.1)
-- این مایگریشن idempotent است:
--  - روی نصب تازه هر دو جدول ساخته می‌شوند
--  - روی نصب‌هایی که جدول ChatMessage را از قبل دارند (1.0.3.0)،
--    CREATE TABLE IF NOT EXISTS بی‌اثر می‌گذارد و فقط جدول واکنش‌ها (ChatReaction)
--    ساخته می‌شود و نوع ستون content به TEXT هم‌گرا می‌شود
-- ========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `ChatMessage_userId_idx` (`userId`),
    INDEX `ChatMessage_parentId_idx` (`parentId`),
    INDEX `ChatMessage_createdAt_idx` (`createdAt`),
    CONSTRAINT `ChatMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ChatMessage_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ChatMessage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ChatReaction` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `ChatReaction_messageId_userId_key` (`messageId`, `userId`),
    INDEX `ChatReaction_userId_idx` (`userId`),
    CONSTRAINT `ChatReaction_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `ChatMessage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ChatReaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- اگر نصب قبلی (1.0.3.0) ستون content را VARCHAR(191) ساخته باشد،
-- بدون از دست رفتن داده به TEXT تبدیل می‌شود (پیام‌های بلند ذخیره شوند)
ALTER TABLE `ChatMessage` MODIFY `content` TEXT NOT NULL;
