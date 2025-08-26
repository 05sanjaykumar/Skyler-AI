// apps/api/src/routes/gmail/gmailRuleBox.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../../middleware/auth";


const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// api/gmail/rulebox/:InstanceId
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    res.json({ ruleBox: instance.ruleBox || "" });
  } catch (error) {
    console.error("Fetch Rule Box Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { ruleBox } = req.body;

    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    await prisma.aIInstance.update({
      where: { id },
      data: { ruleBox },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Update Rule Box Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const instance = await prisma.aIInstance.findUnique({ where: { id } });
    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    await prisma.aIInstance.update({
      where: { id },
      data: { ruleBox: "" },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete Rule Box Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;