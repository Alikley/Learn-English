-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `level` ENUM('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `imageUrl` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NULL,
    `videoUrl` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NULL,
    `xp` INTEGER NOT NULL DEFAULT 10,
    `type` ENUM('TEACH', 'PRACTICE', 'QUIZ') NOT NULL DEFAULT 'TEACH',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lessonprogress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `score` INTEGER NULL,
    `currentStep` INTEGER NOT NULL DEFAULT 0,
    `xpEarned` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `lessonprogress_userId_lessonId_key`(`userId`, `lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `progress` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `enrollment_userId_courseId_key`(`userId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `streak` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `current` INTEGER NOT NULL DEFAULT 0,
    `longest` INTEGER NOT NULL DEFAULT 0,
    `lastActiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `streak_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'MATCHING') NOT NULL,
    `xp` INTEGER NOT NULL DEFAULT 10,
    `answer` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `options` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `question` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `titleFa` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'BEGINNER',
    `coverUrl` VARCHAR(191) NOT NULL,
    `pdfPath` VARCHAR(191) NOT NULL,
    `pages` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lesson` ADD CONSTRAINT `lesson_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lessonprogress` ADD CONSTRAINT `lessonprogress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lessonprogress` ADD CONSTRAINT `lessonprogress_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollment` ADD CONSTRAINT `enrollment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollment` ADD CONSTRAINT `enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `streak` ADD CONSTRAINT `streak_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise` ADD CONSTRAINT `exercise_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
