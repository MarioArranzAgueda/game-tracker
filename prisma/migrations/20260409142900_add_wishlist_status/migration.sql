-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'WISHLIST';

-- AlterTable
ALTER TABLE "UserLibrary" ALTER COLUMN "status" SET DEFAULT 'WISHLIST';
