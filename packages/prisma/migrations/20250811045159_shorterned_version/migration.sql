/*
  Warnings:

  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - The `subscriptionTier` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `GmailInstance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserInstanceQuota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPromptQuota` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionTier" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- DropForeignKey
ALTER TABLE "public"."GmailInstance" DROP CONSTRAINT "GmailInstance_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "subscriptionStatus",
ADD COLUMN     "usedInstances" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usedPrompts" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "subscriptionTier",
ADD COLUMN     "subscriptionTier" "public"."SubscriptionTier" NOT NULL DEFAULT 'FREE';

-- DropTable
DROP TABLE "public"."GmailInstance";

-- DropTable
DROP TABLE "public"."Prompt";

-- DropTable
DROP TABLE "public"."UserInstanceQuota";

-- DropTable
DROP TABLE "public"."UserPromptQuota";

-- DropEnum
DROP TYPE "public"."SubscriptionStatus";

-- CreateTable
CREATE TABLE "public"."AIInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "promptName" TEXT,
    "status" "public"."InstanceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInstance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AIInstance" ADD CONSTRAINT "AIInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
