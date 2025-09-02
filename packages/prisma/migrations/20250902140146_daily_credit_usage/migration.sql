/*
  Warnings:

  - You are about to drop the `CreditLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CreditLog" DROP CONSTRAINT "CreditLog_userId_fkey";

-- DropTable
DROP TABLE "public"."CreditLog";

-- CreateTable
CREATE TABLE "public"."DailyCreditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyCreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCreditUsage_userId_date_key" ON "public"."DailyCreditUsage"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."DailyCreditUsage" ADD CONSTRAINT "DailyCreditUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
