-- ========================================
-- v1.0.8.0 (English 1.0.2.0)
-- نتایج تست تعیین سطح (PlacementResult) — مدل Laya
--
-- این مایگریشن idempotent است:
--  - روی نصب تازه جدول ساخته می‌شود
--  - CREATE TABLE IF NOT EXISTS در اجرای تکراری بی‌اثر است
--
-- هر ردیف نتیجهٔ یک «تعیین سطح» است: سطح نهایی CEFR،
-- نمرهٔ ۸ سوال تشخیصی، جواب‌ها، متن نوشتاری اختیاری و
-- جواب/اطمینان مدل Laya (اگر متن نوشته شده باشد).
-- ========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `PlacementResult` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `cefr` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `mcScore` INTEGER NOT NULL,
    `answers` JSON NOT NULL,
    `writing` TEXT NULL,
    `layaLevel` VARCHAR(191) NULL,
    `layaConfidence` FLOAT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlacementResult_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlacementResult`
    ADD CONSTRAINT `PlacementResult_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
