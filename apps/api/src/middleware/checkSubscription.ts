// apps/api/src/middleware/checkSubscription.ts
import { prisma } from "@skyler-ai/prisma";
import { subscriptionConfig } from "../config/subscriptions";
import { Request, Response } from "express";

interface AuthRequest extends Request {
  userId?: string;
}


export async function checkSubscription(req: AuthRequest, res: Response, next: Function) {
  const userId = req.userId!;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) return res.status(404).json({ error: "User not found" });

  // If expired subscription
  if (user.subscriptionEnd && new Date() > user.subscriptionEnd) {
    await downgradeUser(userId); // Sets free tier quotas
  }

  next();
}

async function downgradeUser(userId: string) {
  const config = subscriptionConfig["free"];

  await prisma.userInstanceQuota.update({
    where: { userId },
    data: { maxInstances: config.maxInstances },
  });

  await prisma.userPromptQuota.update({
    where: { userId },
    data: { monthlyQuota: config.monthlyPrompts },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: "free", subscriptionStatus: "EXPIRED" },
  });
}
