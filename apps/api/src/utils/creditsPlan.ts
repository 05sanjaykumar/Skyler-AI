// apps/api/src/utils/creditsPlan.ts
import { prisma } from "@skyler-ai/prisma";

export async function purchasePlanForUser(userId: string, plan: "mini" | "pro") {
  const PLANS: Record<string, { credits: number; days: number; maxInstances: number }> = {
    mini: { credits: 100, days: 30, maxInstances: 10 },
    pro: { credits: 250, days: 30, maxInstances: 25 },
  };

  if (!PLANS[plan]) throw new Error("Invalid plan");

  const { credits, days, maxInstances } = PLANS[plan];
  const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      creditsRemaining: { increment: credits },
      planExpirationDate: expirationDate,
      maxInstances: { set: maxInstances }, // overwrite with new plan value
    },
    select: { creditsRemaining: true, planExpirationDate: true, maxInstances: true },
  });

  return updated;
}
