-- =============================================
-- بازی حافظه کلمات: جدول اختصاصی MemoryWord
-- هر ردیف = یک کلمه انگلیسی + معنی فارسی + سطح
-- منبع seed: data/memory/words.ts
-- =============================================

-- CreateTable
CREATE TABLE `MemoryWord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(191) NOT NULL,
    `translation` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'general',
    `level` VARCHAR(191) NOT NULL DEFAULT 'EASY',
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
