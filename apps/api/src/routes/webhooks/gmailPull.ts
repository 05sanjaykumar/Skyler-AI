// apps/api/src/routes/webhooks/gmailPull.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { google } from "googleapis";
import { verifyJWT } from "../../middleware/auth";
import { EmailClassifier } from '../../AI_Services/gmail_AI/emailClassifier';

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Helper function to extract plain text content
function extractPlainText(payload: any): string {
  if (!payload) return "";

  // If it's plain text at the top level
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  // If it's multipart, search the parts
  if (payload.parts && payload.parts.length) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
  }

  return ""; // fallback
}

function generateAIContent(payload: any, fallbackSnippet: string) {
  let text = extractPlainText(payload);

  // If empty, fallback to snippet
  if (!text) return fallbackSnippet || "";

  // Take only first 500–1000 characters for AI to save space
  return text.length > 1000 ? text.slice(0, 1000) + "..." : text;
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
          include: { accounts: true }, // next-auth accounts
        },
      },
    });

    if (!instance || instance.userId !== userId) {
      return res.status(404).json({ error: "Instance not found" });
    }

    if (typeof instance.promptDecode === "object" && instance.promptDecode !== null && "gmailParams" in instance.promptDecode) {
      console.log('ai instance max results:', (instance.promptDecode as any).gmailParams);
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

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch messages
    const { data } = await gmail.users.messages.list({
      userId: "me",
      maxResults: (instance.promptDecode as any)?.gmailParams?.maxResults ?? 10,
      q: [
    (instance.promptDecode as any)?.gmailParams?.dateQuery ?? "",
    (instance.promptDecode as any)?.gmailParams?.searchQuery ?? ""
  ]
    .filter(Boolean) // remove empty strings
    .join(" ")
    });

    const messages: any[] = [];

    if (data.messages) {
      if (data.messages) {
        const BATCH_SIZE = 10; // tweak: 20–50 is usually safe for Gmail API

        // Break messages into chunks
        for (let i = 0; i < data.messages.length; i += BATCH_SIZE) {
          const batch = data.messages.slice(i, i + BATCH_SIZE);

          // Fire all requests in this batch in parallel
          const batchResults = await Promise.all(
            batch.map(async (msg) => {
              const msgData = await gmail.users.messages.get({
                userId: "me",
                id: msg.id!,
              });

              const payload = msgData.data.payload;
              const headers = payload?.headers || [];

              return {
                id: msg.id!,
                threadId: msgData.data.threadId,
                date: headers.find((h: any) => h.name === "Date")?.value,
                from: headers.find((h: any) => h.name === "From")?.value,
                to: headers.find((h: any) => h.name === "To")?.value,
                subject: headers.find((h: any) => h.name === "Subject")?.value,
                snippet: msgData.data.snippet || "",
                aiContent: generateAIContent(payload, msgData.data.snippet ?? ""),
                body: null,
              };
            })
          );

          messages.push(...batchResults); // add results of this batch
        }
      }
    }


    // Add here email classification for messages

    const aiFilterRules =
      typeof instance.promptDecode === "object" &&
      instance.promptDecode !== null &&
      "aiFilterRules" in instance.promptDecode
        ? (instance.promptDecode as any).aiFilterRules
        : {};

    if(aiFilterRules) {
      const classifier = new EmailClassifier();
      await classifier.init();
      console.log('inside ai filter')
      const filteredEmails = await classifier.filterEmails(messages, aiFilterRules);
      return res.json({ instanceId, count: filteredEmails.length, messages: filteredEmails });
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

// GET /api/gmail/pull/full/:messageId
router.get("/full/:messageId", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId!;

    // Find a user with a linked Google account
    const googleAccount = await prisma.account.findFirst({
      where: { userId, provider: "google" },
    });

    if (!googleAccount || !googleAccount.access_token || !googleAccount.refresh_token) {
      return res.status(400).json({ error: "No Gmail account linked" });
    }

    // OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: googleAccount.access_token,
      refresh_token: googleAccount.refresh_token,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch the specific message
    const msgData = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const payload = msgData.data.payload;

    // Extract full HTML body if exists
    let fullBody = "";
    if (payload?.mimeType === "text/html" && payload.body?.data) {
      fullBody = Buffer.from(payload.body.data, "base64").toString("utf-8");
    } else if (payload?.parts && payload.parts.length) {
      const htmlPart = payload.parts.find((p: any) => p.mimeType === "text/html");
      if (htmlPart?.body?.data) {
        fullBody = Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
      }
    }

    res.json({
      id: msgData.data.id,
      threadId: msgData.data.threadId,
      subject: payload?.headers?.find((h: any) => h.name === "Subject")?.value,
      from: payload?.headers?.find((h: any) => h.name === "From")?.value,
      to: payload?.headers?.find((h: any) => h.name === "To")?.value,
      date: payload?.headers?.find((h: any) => h.name === "Date")?.value,
      body: fullBody,
    });
  } catch (err) {
    console.error("Gmail Full Email Error:", err);
    res.status(500).json({ error: "Failed to fetch full email" });
  }
});


export default router;
