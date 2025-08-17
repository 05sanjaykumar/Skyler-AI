// apps/api/src/services/aiServices.ts
import  { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import axios from "axios";
import { verifyJWT } from "../middleware/auth";
import { groqAIProcess } from "../lib/groqAI"; // custom AI processing helper
import dotenv from "dotenv";
dotenv.config();


const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

export async function decodePrompt(promptName: string | null) {
  if (!promptName) {
    return {
      sendingPrompt: { maxResults: 10 }, // default minimal fetch
      filteringPrompt: null,             // no filtering needed
    };
  }

  // TODO: Use AI or LangChain to parse the natural language prompt
  // Example return from AI:
  return {
    sendingPrompt: {
      maxResults: 50,
      dateRange: "last_7_days",  // or actual date objects
    },
    filteringPrompt: {
      keywords: ["billing", "complaint"],
    },
  };
}

// GET /api/ai_services/:instanceId
router.get("/:instanceId", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { instanceId } = req.params;
    const userId = req.userId!;

    // Get instance details
    const instance = await prisma.aIInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    // Call gmail/pull endpoint to get email data
    const gmailResponse = await axios.get(
      `${process.env.BACKEND_URL}/api/gmail/pull/${instanceId}`,
      {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      }
    );

    const gmailData = gmailResponse.data;

    // If no promptName → return Gmail data as-is
    if (!instance.promptName) {
      return res.json(gmailData);
    }

    // Else → run AI processing on Gmail data
    const processedMessages = await groqAIProcess(instance.promptName, gmailData.messages);

    return res.json({
      instanceId,
      count: processedMessages.length,
      messages: processedMessages,
    });
  } catch (err) {
    console.error("AI Services Error:", err);
    res.status(500).json({ error: "Failed to process AI service" });
  }
});

export default router;
