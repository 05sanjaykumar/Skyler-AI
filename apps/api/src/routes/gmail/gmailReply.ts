// apps/api/src/routes/gmail/gmailReply.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { verifyJWT } from "../../middleware/auth";


const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// api/gmail/reply/:mailID
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {});

export default router;