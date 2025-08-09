-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."InstanceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'UNPAID');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "subscriptionEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionStart" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscriptionTier" TEXT;
