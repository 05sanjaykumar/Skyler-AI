// apps/api/src/routes/prompt.ts

import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../middleware/auth";
import { subscriptionConfig } from "../config/subscriptions";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Assign or change prompt
router.patch("/:id/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { promptName } = req.body;

    if (!promptName || typeof promptName !== "string") {
      return res.status(400).json({ error: "Prompt name required" });
    }

    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    const updated = await prisma.aIInstance.update({
      where: { id },
      data: { promptName },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update Prompt Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;