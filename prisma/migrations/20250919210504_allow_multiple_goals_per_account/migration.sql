/*
  Warnings:

  - You are about to drop the column `lastAlertSent` on the `goals` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "goals_userId_key";

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "lastAlertSent",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "goals_accountId_idx" ON "goals"("accountId");

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
