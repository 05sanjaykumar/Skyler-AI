// apps/api/src/routes/Credits.ts

import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Define your plans in one place for easy scaling
const PLANS: Record<string, { credits: number; days: number }> = {
  mini: { credits: 100, days: 30 },
  pro: { credits: 200, days: 30 },
};

router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditsRemaining: true, planExpirationDate: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check expiration
    if (user.planExpirationDate && user.planExpirationDate < new Date()) {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { creditsRemaining: 0 },
        select: { creditsRemaining: true, planExpirationDate: true },
      });
      return res.json(updated);
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/checkCredits", verifyJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { cost } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (cost === undefined || isNaN(cost)) {
    return res.status(400).json({ error: "Invalid or missing cost parameter" });
  }

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditsRemaining: true, planExpirationDate: true },
      });

      if (!user) throw new Error("User not found");

      if (user.planExpirationDate && user.planExpirationDate < new Date()) {
        await tx.user.update({
          where: { id: userId },
          data: { creditsRemaining: 0 },
        });
        throw new Error("Plan expired");
      }

      if (user.creditsRemaining < cost) {
        throw new Error("Insufficient credits");
      }

      return tx.user.update({
        where: { id: userId },
        data: { creditsRemaining: user.creditsRemaining - cost },
        select: { creditsRemaining: true, planExpirationDate: true },
      });
    });

    return res.json(updatedUser);
  } catch (error: any) {
    console.error("Error checking credits:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Plan expired") {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === "Insufficient credits") {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/buy", verifyJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { plan } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!plan || !PLANS[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const { credits, days } = PLANS[plan];
  const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        creditsRemaining: credits, // reset credits when buying a new plan
        planExpirationDate: expirationDate,
      },
      select: { creditsRemaining: true, planExpirationDate: true },
    });

    return res.json({
      message: `Credits purchased successfully and added ${credits} credits.`,
      user: updated,
    });
  } catch (error) {
    console.error("Error updating user plan:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
