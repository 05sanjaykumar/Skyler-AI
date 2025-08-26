// apps/api/src/routes/gmail/gmailRuleBox.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../../middleware/auth";


const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// api/gmail/storebox/:InstanceId
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {});

export default router;