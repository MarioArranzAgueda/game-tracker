-- AlterTable
ALTER TABLE "UserLibrary" ADD COLUMN     "sortOrder" INTEGER;

-- CreateIndex
CREATE INDEX "UserLibrary_status_sortOrder_idx" ON "UserLibrary"("status", "sortOrder");
