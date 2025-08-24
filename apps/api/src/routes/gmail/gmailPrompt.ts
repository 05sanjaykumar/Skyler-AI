// apps/api/src/routes/gmailPrompt.ts

import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../../middleware/auth";
import { ImprovedPromptDecoder } from "../../AI_Services/gmail_AI/promptDecoder";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// api/gmail/prompt/:id
router.post("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    
    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== req.userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    const decoder = new ImprovedPromptDecoder();
    const result = await decoder.decode(prompt);

    await prisma.aIInstance.update({
      where: { id },
      data: { 
        promptDecode: JSON.parse(JSON.stringify(result)), 
        promptName: prompt // optional if you want to store raw prompt text too
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Decode Prompt Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// api/gmail/prompt/:id/saveForm
router.post("/:id/saveForm", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { details } = req.body; // 🔑 expects { details: {...} }

    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== req.userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    const updated = await prisma.aIInstance.update({
      where: { id },
      data: {
        promptDecode: JSON.parse(JSON.stringify(details)),
      }
    });

    res.json(updated.promptDecode);
  } catch (error) {
    console.error("Save Form Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/loadForm", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== req.userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    res.json(instance.promptDecode);
  } catch (error) {
    console.error("Load Form Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;