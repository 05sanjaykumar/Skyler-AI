/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AIInstance` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `AIInstance` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AIInstance` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEnd` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStart` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionTier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usedInstances` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usedPrompts` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AIInstance" DROP COLUMN "createdAt",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "promptDecode" JSONB,
ADD COLUMN     "webhook" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "subscriptionEnd",
DROP COLUMN "subscriptionStart",
DROP COLUMN "subscriptionTier",
DROP COLUMN "usedInstances",
DROP COLUMN "usedPrompts",
ADD COLUMN     "creditsRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "planExpirationDate" TIMESTAMP(3);

-- DropEnum
DROP TYPE "public"."InstanceStatus";

-- DropEnum
DROP TYPE "public"."SubscriptionTier";

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "creditsBought" INTEGER NOT NULL,
    "paymentProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreditLog" ADD CONSTRAINT "CreditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
