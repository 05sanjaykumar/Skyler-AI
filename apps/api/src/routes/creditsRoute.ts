// apps/api/src/routes/creditsRoute.ts
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
      select: { creditsRemaining: true, planExpirationDate: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check expiration
    if (user.planExpirationDate && user.planExpirationDate < new Date()) {
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30); // 30 days from today

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          creditsRemaining: 25,
          planExpirationDate: newExpirationDate, // push expiration forward
        },
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
      // Fetch user
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditsRemaining: true, planExpirationDate: true },
      });

      if (!user) throw new Error("User not found");

      // Handle expired plan
      if (user.planExpirationDate && user.planExpirationDate < new Date()) {
        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + 30); // 30 days from today

        const updated = await tx.user.update({
          where: { id: userId },
          data: {
            creditsRemaining: 25,
            planExpirationDate: newExpirationDate,
          },
          select: { creditsRemaining: true, planExpirationDate: true },
        });

        return res.json(updated);
      }

      // Check if enough credits
      if (user.creditsRemaining < cost) {
        throw new Error("Insufficient credits");
      }

      // Deduct credits
      const newCredits = user.creditsRemaining - cost;
      const updated = await tx.user.update({
        where: { id: userId },
        data: { creditsRemaining: newCredits },
        select: { creditsRemaining: true, planExpirationDate: true },
      });

      // Record daily usage
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0); // truncate to start of day UTC

      await tx.dailyCreditUsage.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          creditsUsed: { increment: cost },
        },
        create: {
          userId,
          date: today,
          creditsUsed: cost,
        },
      });

      return updated;
    });

    return res.json(updatedUser);
  } catch (error: any) {
    console.error("Error checking credits:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Insufficient credits") {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;