// apps/api/src/routes/prompts.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../middleware/auth";

const router = Router();

const FREE_PROMPT_EDIT_LIMIT = 10;

interface AuthRequest extends Request {
  userId?: string;
}

// Get prompts for a specific GmailInstance (ownership checked)
router.get("/instance/:instanceId", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { instanceId } = req.params;

    const instance = await prisma.gmailInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found or access denied" });
    }

    const prompts = await prisma.prompt.findMany({
      where: { gmailInstanceId: instanceId },
    });

    res.json(prompts);
  } catch (error) {
    console.error("Get Prompts Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create prompt inside GmailInstance (ownership + limit check)
router.post("/instance/:instanceId", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { instanceId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Prompt content required" });
    }

    const instance = await prisma.gmailInstance.findUnique({ where: { id: instanceId } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found or access denied" });
    }

    const prompt = await prisma.prompt.create({
      data: {
        content,
        gmailInstanceId: instanceId,
      },
    });

    res.status(201).json(prompt);
  } catch (error) {
    console.error("Create Prompt Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update prompt content & increment editCount (with edit limit)
router.patch("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "New prompt content required" });
    }

    // Fetch prompt with instance relation to check ownership
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: { gmailInstance: true },
    });

    if (!prompt || prompt.gmailInstance.userId !== userId) {
      return res.status(404).json({ error: "Prompt not found or access denied" });
    }

    if (prompt.editCount >= FREE_PROMPT_EDIT_LIMIT) {
      return res.status(403).json({ error: "Prompt edit limit reached" });
    }

    const updated = await prisma.prompt.update({
      where: { id },
      data: {
        content,
        editCount: { increment: 1 },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update Prompt Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete prompt (ownership check)
router.delete("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: { gmailInstance: true },
    });

    if (!prompt || prompt.gmailInstance.userId !== userId) {
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
