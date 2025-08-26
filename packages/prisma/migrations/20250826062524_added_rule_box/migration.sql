/*
  Warnings:

  - You are about to drop the column `storeBox` on the `AIInstance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AIInstance" DROP COLUMN "storeBox",
ADD COLUMN     "ruleBox" TEXT;
