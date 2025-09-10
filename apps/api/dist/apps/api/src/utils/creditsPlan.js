"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchasePlanForUser = purchasePlanForUser;
// apps/api/src/utils/creditsPlan.ts
const prisma_1 = require("../../../../packages/prisma/src/client");
async function purchasePlanForUser(userId, plan) {
    const PLANS = {
        mini: { credits: 200, days: 30, maxInstances: 10 },
        pro: { credits: 500, days: 30, maxInstances: 25 },
    };
    if (!PLANS[plan])
        throw new Error("Invalid plan");
    const { credits, days, maxInstances } = PLANS[plan];
    const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    // Fetch current user first
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { maxInstances: true } });
    if (!user)
        throw new Error("User not found");
    const updated = await prisma_1.prisma.user.update({
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
