// apps/api/src/routes/instances.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Get all AIInstances for user
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const instances = await prisma.aIInstance.findMany({
      where: { userId },
    });
    res.json(instances);
  } catch (error) {
    console.error("Get Instances Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET instance by ID
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const instance = await prisma.aIInstance.findUnique({
      where: { id },
    });

    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }
    console.log("Fetched instance from backend :", instance);
    res.json(instance);
  } catch (error) {
    console.error("Get Instance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new AIInstance with quota check
router.post("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Instance name required" });
    }

    // Get user + plan
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const instanceCount = await prisma.aIInstance.count({ where: { userId } });

    if (instanceCount >= 10) {
      return res.status(403).json({ error: "Instance limit reached" });
    }

    // Create instance (no prompt assigned yet)
    const newInstance = await prisma.aIInstance.create({
      data: {
        name,
        promptName: null,
        userId,
      },
    });

    res.status(201).json(newInstance);
  } catch (error) {
    console.error("Create Instance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Rename AIInstance
router.patch("/:id/name", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "New instance name required" });
    }

    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    const updated = await prisma.aIInstance.update({
      where: { id },
      data: { name },
    });

    res.json(updated);
  } catch (error) {
    console.error("Rename Instance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Delete AIInstance
router.delete("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    await prisma.aIInstance.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete Instance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
