-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "providerTxnId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
