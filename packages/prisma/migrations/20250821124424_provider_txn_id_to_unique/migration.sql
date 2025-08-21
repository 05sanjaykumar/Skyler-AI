/*
  Warnings:

  - A unique constraint covering the columns `[providerTxnId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_providerTxnId_key" ON "public"."Transaction"("providerTxnId");
