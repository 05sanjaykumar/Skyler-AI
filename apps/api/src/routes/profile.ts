// apps/api/src/routes/profile.ts

import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}


router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                image: true,
                creditsRemaining: true,
                planExpirationDate: true,
                transactions: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        paymentProvider: true,
                        currency: true,
                        createdAt: true,
                    },
                },
            },
        });

        return res.json(user);
    } catch (error) {
        console.error("Profile API error:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

export default router;
