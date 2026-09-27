-- =============================================
-- بازی کوییز سرعتی: جدول اختصاصی SpeedQuizQuestion
-- هر ردیف = یک سوال چهارگزینه‌ای (کلمه یا جمله)
-- type=WORD → prompt=کلمه، answer=معنی فارسی درست، distractors=JSON ۳ گزینه
-- type=SENTENCE → prompt=جمله با جای خالی ___، answer=کلمه درست
-- منبع seed: data/speedquiz/questions.ts
-- =============================================

-- CreateTable
CREATE TABLE `SpeedQuizQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL DEFAULT 'WORD',
    `prompt` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `distractors` VARCHAR(191) NOT NULL DEFAULT '[]',
    `translation` VARCHAR(191) NOT NULL DEFAULT '',
    `category` VARCHAR(191) NOT NULL DEFAULT 'general',
    `level` VARCHAR(191) NOT NULL DEFAULT 'EASY',
    `cefr` VARCHAR(191) NOT NULL DEFAULT 'A1',
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE INDEX `SpeedQuizQuestion_level_isActive_idx` ON `SpeedQuizQuestion`(`level`, `isActive`);
