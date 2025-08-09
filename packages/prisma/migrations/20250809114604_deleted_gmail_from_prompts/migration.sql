/*
  Warnings:

  - You are about to drop the column `gmailInstanceId` on the `Prompt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Prompt" DROP COLUMN "gmailInstanceId";
