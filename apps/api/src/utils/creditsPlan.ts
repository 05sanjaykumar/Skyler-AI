// apps/api/src/utils/creditsPlan.ts
import { prisma } from "@skyler-ai/prisma";

export async function purchasePlanForUser(userId: string, plan: "mini" | "pro") {
  const PLANS: Record<string, { credits: number; days: number; maxInstances: number }> = {
    mini: { credits: 200, days: 30, maxInstances: 10 },
    pro: { credits: 500, days: 30, maxInstances: 25 },
  };

  if (!PLANS[plan]) throw new Error("Invalid plan");

  const { credits, days, maxInstances } = PLANS[plan];
  const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // Fetch current user first
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { maxInstances: true } });

  if (!user) throw new Error("User not found");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      creditsRemaining: { increment: credits },
      planExpirationDate: expirationDate,
      // ✅ Only increase, never decrease
      maxInstances: { set: Math.max(user.maxInstances, maxInstances) },
    },
    select: { creditsRemaining: true, planExpirationDate: true, maxInstances: true },
  });

  return { ...updated, creditsBought: credits };
}
