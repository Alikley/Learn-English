-- CreateTable
CREATE TABLE `GameWord` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `word` VARCHAR(191) NOT NULL,
  `hint` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL DEFAULT 'general',
  `level` VARCHAR(191) NOT NULL DEFAULT 'BEGINNER',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameScore` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `game` VARCHAR(191) NOT NULL DEFAULT 'hangman',
  `bestScore` INTEGER NOT NULL DEFAULT 0,
  `totalWins` INTEGER NOT NULL DEFAULT 0,
  `totalLosses` INTEGER NOT NULL DEFAULT 0,
  `sessionsPlayed` INTEGER NOT NULL DEFAULT 0,
  `lastPlayedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `GameScore_userId_game_key` ON `GameScore`(`userId`, `game`);

-- AddForeignKey
ALTER TABLE `GameScore` ADD CONSTRAINT `GameScore_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
