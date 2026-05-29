-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FULL_COMPLETION');

-- CreateTable
CREATE TABLE "Game" (
    "igdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "releaseYear" INTEGER,
    "developer" TEXT,
    "avgRating" DECIMAL(5,2),
    "durationHours" INTEGER,
    "rawData" JSONB,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("igdbId")
);

-- CreateTable
CREATE TABLE "UserLibrary" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'PENDING',
    "personalScore" DECIMAL(5,2),
    "personalNotes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_igdbId_key" ON "Game"("igdbId");

-- CreateIndex
CREATE INDEX "UserLibrary_status_idx" ON "UserLibrary"("status");

-- AddForeignKey
ALTER TABLE "UserLibrary" ADD CONSTRAINT "UserLibrary_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("igdbId") ON DELETE RESTRICT ON UPDATE CASCADE;
