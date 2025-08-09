// apps/api/src/routes/prompts.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Get all prompts for the user 
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const prompts = await prisma.prompt.findMany({
      where: { userId },
    });
    res.json(prompts);
  } catch (error) {
    console.error("Get Prompts Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new prompt (check monthly quota globally)
router.post("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { content, gmailInstanceId } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Prompt content required" });
    }
    if (!gmailInstanceId || typeof gmailInstanceId !== "string") {
      return res.status(400).json({ error: "gmailInstanceId is required" });
    }

    // Check user prompt quota
    const userQuota = await prisma.userPromptQuota.findUnique({ where: { userId } });
    if (userQuota && userQuota.usedQuota >= userQuota.monthlyQuota) {
      return res.status(403).json({ error: "Prompt quota exceeded for this month" });
    }

    const prompt = await prisma.prompt.create({
      data: {
        content,
        userId,
      },
    });

    // Increment usedQuota after prompt creation
    if (userQuota) {
      await prisma.userPromptQuota.update({
        where: { userId },
        data: { usedQuota: { increment: 1 } },
      });
    }

    res.status(201).json(prompt);
  } catch (error) {
    console.error("Create Prompt Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update prompt content & increment editCount (with global edit limit)
router.patch("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "New prompt content required" });
    }

    const prompt = await prisma.prompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      return res.status(404).json({ error: "Prompt not found or access denied" });
    }

    const userQuota = await prisma.userPromptQuota.findUnique({ where: { userId } });
    if (prompt.editCount >= (userQuota?.monthlyQuota ?? 10)) {
      return res.status(403).json({ error: "Prompt edit limit reached" });
    }

    const updated = await prisma.prompt.update({
      where: { id },
      data: {
        content,
        editCount: { increment: 1 },
      },
    });

    // Increment usedQuota for edits
    if (userQuota) {
      await prisma.userPromptQuota.update({
        where: { userId },
        data: { usedQuota: { increment: 1 } },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Prompt Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete prompt (ownership check, no quota adjustment here)
router.delete("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const prompt = await prisma.prompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      return res.status(404).json({ error: "Prompt not found or access denied" });
    }

    await prisma.prompt.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete Prompt Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
