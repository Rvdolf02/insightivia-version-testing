-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "goalId" TEXT;

-- CreateIndex
CREATE INDEX "transactions_goalId_idx" ON "transactions"("goalId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
