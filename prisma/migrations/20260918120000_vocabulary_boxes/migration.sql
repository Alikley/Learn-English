-- =============================================
-- لغت‌نامه (نسخه ۱.۰.۱.۶): جعبه‌های لغات کاربر
-- هر کاربر ۴ جعبه پیش‌فرض دارد (ایجاد خودکار در اولین درخواست)
-- هر جعبه حداکثر ۱۰ کلمه (کنترل در API)
-- منبع کلمه‌ها: هاور روی کلمه‌های انگلیسی در کل سایت + افزودن دستی
-- =============================================

-- CreateTable
CREATE TABLE `WordBox` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordBoxItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `boxId` INTEGER NOT NULL,
    `word` VARCHAR(80) NOT NULL,
    `translation` VARCHAR(160) NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `WordBox_userId_idx` ON `WordBox`(`userId`);

-- CreateIndex
CREATE INDEX `WordBoxItem_boxId_idx` ON `WordBoxItem`(`boxId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordBoxItem_boxId_word_key` ON `WordBoxItem`(`boxId`, `word`);

-- AddForeignKey
ALTER TABLE `WordBox` ADD CONSTRAINT `WordBox_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordBoxItem` ADD CONSTRAINT `WordBoxItem_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `WordBox`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
