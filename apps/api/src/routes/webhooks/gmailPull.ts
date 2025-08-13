// apps/api/src/routes/webhooks/gmailPull.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { google } from "googleapis";
import { verifyJWT } from "../../middleware/auth";
import { Buffer } from "buffer";
import { decode } from "html-entities";


const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Helper: extract header value
function getHeader(headers: any[], name: string) {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : "";
}



function extractEmailContent(payload: any): string {
  if (!payload) return "";

  // Function to decode base64 URL-safe
  const decodeBase64 = (str: string) =>
    Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");

  // Search for text/plain first
  if (payload.parts && payload.parts.length) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
      if (part.parts && part.parts.length) {
        const nested = extractEmailContent(part);
        if (nested) return nested;
      }
    }
  }

  // Single-part email
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // fallback: use HTML
  if (payload.parts && payload.parts.length) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = decodeBase64(part.body.data);
        return decode(html.replace(/<[^>]+>/g, "")); // strip HTML tags and decode entities
      }
    }
  }

  if (payload.mimeType === "text/html" && payload.body?.data) {
    const html = decodeBase64(payload.body.data);
    return decode(html.replace(/<[^>]+>/g, ""));
  }

  return ""; // still empty if nothing found
}


// Helper: filter single email
function filterEmail(msg: any) {
  const headers = msg.payload.headers;

  return {
    id: msg.id,
    threadId: msg.threadId,
    from: getHeader(headers, "From"),
    subject: getHeader(headers, "Subject"),
    date: getHeader(headers, "Date"),
    snippet: msg.snippet,
    content: extractEmailContent(msg.payload),
    labelIds: msg.labelIds,
  };
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

    // Fetch message IDs
    const { data } = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "", // optional search query
    });

    const messages: any[] = [];

    if (data.messages) {
      for (const msg of data.messages) {
        const msgData = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
        });
        // Filter the message
        messages.push(filterEmail(msgData.data));
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
