// apps/api/src/routes/instances.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Get all GmailInstances for user
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const instances = await prisma.gmailInstance.findMany({
      where: { userId },
    });
    res.json(instances);
  } catch (error) {
    console.error("Get Instances Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new GmailInstance with quota check
router.post("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Instance name required" });
    }

    // Check instance quota
    const quota = await prisma.userInstanceQuota.findUnique({ where: { userId } });
    if (quota && quota.currentCount >= quota.maxInstances) {
      return res.status(403).json({ error: "Instance limit reached" });
    }

    const newInstance = await prisma.gmailInstance.create({
      data: { name, userId },
    });

    // Update current count after creation
    if (quota) {
      await prisma.userInstanceQuota.update({
        where: { userId },
        data: { currentCount: { increment: 1 } },
      });
    }

    res.status(201).json(newInstance);
  } catch (error) {
    console.error("Create Instance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Rename GmailInstance (ownership check)
router.patch("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "New instance name required" });
    }

    const instance = await prisma.gmailInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    const updated = await prisma.gmailInstance.update({
      where: { id },
      data: { name },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update Instance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update GmailInstance status
router.patch("/:id/status", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "PAUSED", "UNPAID"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const instance = await prisma.gmailInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    const updated = await prisma.gmailInstance.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete GmailInstance (ownership check + decrement quota)
router.delete("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const instance = await prisma.gmailInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    await prisma.gmailInstance.delete({ where: { id } });

    // Decrement currentCount in quota if exists
    const quota = await prisma.userInstanceQuota.findUnique({ where: { userId } });
    if (quota && quota.currentCount > 0) {
      await prisma.userInstanceQuota.update({
        where: { userId },
        data: { currentCount: { decrement: 1 } },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete Instance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
