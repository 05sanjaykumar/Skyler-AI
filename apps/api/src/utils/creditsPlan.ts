// apps/api/src/utils/creditsPlan.ts
import { prisma } from "@skyler-ai/prisma";

export async function purchasePlanForUser(userId: string, plan: "mini" | "pro") {
  const PLANS: Record<string, { credits: number; days: number }> = {
    mini: { credits: 100, days: 30 },
    pro: { credits: 200, days: 30 },
  };

  if (!PLANS[plan]) throw new Error("Invalid plan");

  const { credits, days } = PLANS[plan];
  const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      creditsRemaining: { increment: credits }, // reset/add credits
      planExpirationDate: expirationDate,
    },
    select: { creditsRemaining: true, planExpirationDate: true },
  });

  return updated;
}
