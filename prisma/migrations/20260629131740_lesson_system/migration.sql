/*
  Warnings:

  - You are about to drop the column `createdAt` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `exercise` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `exercise` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `exercise` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `exercise` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `exercise` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `exercise` table. All the data in the column will be lost.
  - The values [FLASHCARD,LISTENING,SPEAKING,GRAMMAR] on the enum `exercise_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `lesson` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversationparticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gamescore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationtoken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vocabprogress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vocabword` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `answer` to the `exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonId` to the `exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course` DROP COLUMN `createdAt`;

-- AlterTable
ALTER TABLE `exercise` DROP COLUMN `content`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `isPublished`,
    DROP COLUMN `level`,
    DROP COLUMN `title`,
    ADD COLUMN `answer` VARCHAR(191) NOT NULL,
    ADD COLUMN `lessonId` VARCHAR(191) NOT NULL,
    ADD COLUMN `options` JSON NULL,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `question` LONGTEXT NOT NULL,
    MODIFY `type` ENUM('MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'MATCHING') NOT NULL,
    MODIFY `xp` INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE `lesson` DROP COLUMN `createdAt`,
    ADD COLUMN `type` ENUM('TEACH', 'PRACTICE', 'QUIZ') NOT NULL DEFAULT 'TEACH';

-- AlterTable
ALTER TABLE `lessonprogress` ADD COLUMN `currentStep` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `xpEarned` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `emailVerified`;

-- DropTable
DROP TABLE `account`;

-- DropTable
DROP TABLE `conversation`;

-- DropTable
DROP TABLE `conversationparticipant`;

-- DropTable
DROP TABLE `game`;

-- DropTable
DROP TABLE `gamescore`;

-- DropTable
DROP TABLE `message`;

-- DropTable
DROP TABLE `notification`;

-- DropTable
DROP TABLE `session`;

-- DropTable
DROP TABLE `verificationtoken`;

-- DropTable
DROP TABLE `vocabprogress`;

-- DropTable
DROP TABLE `vocabword`;

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
ALTER TABLE `exercise` ADD CONSTRAINT `exercise_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `enrollment` RENAME INDEX `Enrollment_userId_courseId_key` TO `enrollment_userId_courseId_key`;

-- RenameIndex
ALTER TABLE `lessonprogress` RENAME INDEX `LessonProgress_userId_lessonId_key` TO `lessonprogress_userId_lessonId_key`;

-- RenameIndex
ALTER TABLE `streak` RENAME INDEX `Streak_userId_key` TO `streak_userId_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
