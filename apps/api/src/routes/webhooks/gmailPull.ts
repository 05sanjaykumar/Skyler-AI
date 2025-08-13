// apps/api/src/routes/webhooks/gmailPull.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { google } from "googleapis";
import { verifyJWT } from "../../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// GET /api/gmail/pull/:instanceId
router.get("/:instanceId", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { instanceId } = req.params;
    const userId = req.userId!;

    // Find instance
    const instance = await prisma.aIInstance.findUnique({
      where: { id: instanceId },
      include: {
        user: {
          include: {
            accounts: true, // next-auth accounts
          },
        },
      },
    });

    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    // Get Google account tokens
    const googleAccount = instance.user.accounts.find(
      (acc) => acc.provider === "google"
    );
    if (!googleAccount || !googleAccount.access_token || !googleAccount.refresh_token) {
      return res.status(400).json({ error: "No Gmail account linked" });
    }

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: googleAccount.access_token,
      refresh_token: googleAccount.refresh_token,
    });

    // Gmail API
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch messages
    const { data } = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10, // adjust as needed
      q: "", // add search query if needed
    });

    const messages = [];

    if (data.messages) {
      for (const msg of data.messages) {
        const msgData = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
        });
        messages.push(msgData.data);
      }
    }

    res.json({
      instanceId,
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error("Gmail Pull Error:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

export default router;
