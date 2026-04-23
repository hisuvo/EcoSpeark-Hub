/*
  Warnings:

  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,ideaId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripePaymentIntentId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payment_amount_idx";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "stripeClientSecret" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "payments_stripePaymentIntentId_idx" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_userId_ideaId_key" ON "payments"("userId", "ideaId");

-- RenameIndex
ALTER INDEX "payment_status_idx" RENAME TO "payments_status_idx";
