-- AlterTable
ALTER TABLE "public"."GmailInstance" ADD COLUMN     "status" "public"."InstanceStatus" NOT NULL DEFAULT 'ACTIVE';
