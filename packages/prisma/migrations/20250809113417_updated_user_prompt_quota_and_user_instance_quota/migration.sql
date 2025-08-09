-- CreateTable
CREATE TABLE "public"."UserInstanceQuota" (
    "userId" TEXT NOT NULL,
    "maxInstances" INTEGER NOT NULL,
    "currentCount" INTEGER NOT NULL,

    CONSTRAINT "UserInstanceQuota_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."UserPromptQuota" (
    "userId" TEXT NOT NULL,
    "monthlyQuota" INTEGER NOT NULL,
    "usedQuota" INTEGER NOT NULL,
    "lastReset" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPromptQuota_pkey" PRIMARY KEY ("userId")
);
