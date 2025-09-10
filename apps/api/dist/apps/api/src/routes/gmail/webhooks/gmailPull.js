"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/routes/webhooks/gmailPull.ts
const express_1 = require("express");
const prisma_1 = require("../../../../../../packages/prisma/src/client");
const googleapis_1 = require("googleapis");
const auth_1 = require("../../../middleware/auth");
const emailClassifier_1 = require("../../../AI_Services/gmail_AI/emailClassifier");
const router = (0, express_1.Router)();
// ====================
// Helper Functions
// ====================
// Extract plain text from Gmail payload
function extractPlainText(payload) {
    if (!payload)
        return "";
    if (payload.mimeType === "text/plain" && payload.body?.data) {
        return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }
    if (payload.parts && payload.parts.length) {
        for (const part of payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
                return Buffer.from(part.body.data, "base64").toString("utf-8");
            }
        }
    }
    return "";
}
// Generate AI-friendly snippet
function generateAIContent(payload, fallbackSnippet) {
    let text = extractPlainText(payload);
    if (!text)
        return fallbackSnippet || "";
    return text.length > 1000 ? text.slice(0, 1000) + "..." : text;
}
// Rate-limit aware fetch with exponential backoff
async function fetchWithRetry(fn, retries = 5, delay = 1000) {
    try {
        return await fn();
    }
    catch (err) {
        if (retries <= 0)
            throw err;
        // Handle Gmail API rate-limit & transient errors
        const retryable = err?.code === 429 || // rate-limit
            err?.code === 403 || // quota exceeded
            err?.code === 'ECONNRESET';
        if (retryable) {
            console.warn(`Retrying Gmail API request in ${delay}ms... (${retries} retries left)`);
            await new Promise((res) => setTimeout(res, delay));
            return fetchWithRetry(fn, retries - 1, delay * 2); // exponential backoff
        }
        throw err;
    }
}
// ====================
// Gmail OAuth Client Setup
// ====================
async function getAuthorizedGmailClient(userId) {
    const googleAccount = await prisma_1.prisma.account.findFirst({
        where: { userId, provider: "google" },
    });
    if (!googleAccount || !googleAccount.access_token || !googleAccount.refresh_token) {
        throw new Error("No Gmail account linked");
    }
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    oauth2Client.setCredentials({
        access_token: googleAccount.access_token,
        refresh_token: googleAccount.refresh_token,
    });
    // Auto-refresh tokens and update DB
    oauth2Client.on("tokens", async (tokens) => {
        if (tokens.refresh_token || tokens.access_token) {
            await prisma_1.prisma.account.update({
                where: { id: googleAccount.id },
                data: {
                    access_token: tokens.access_token ?? googleAccount.access_token,
                    refresh_token: tokens.refresh_token ?? googleAccount.refresh_token,
                    expires_at: tokens.expiry_date
                },
            });
        }
    });
    return googleapis_1.google.gmail({ version: "v1", auth: oauth2Client });
}
// ====================
// Routes
// ====================
// GET /api/gmail/pull/:instanceId
router.get("/:instanceId", auth_1.verifyJWT, async (req, res) => {
    try {
        const { instanceId } = req.params;
        const userId = req.userId;
        // Fetch instance
        const instance = await prisma_1.prisma.aIInstance.findUnique({
            where: { id: instanceId },
            include: { user: { include: { accounts: true } } },
        });
        if (!instance || instance.userId !== userId) {
            return res.status(404).json({ error: "Instance not found" });
        }
        const gmail = await getAuthorizedGmailClient(userId);
        const maxResults = instance.promptDecode?.gmailParams?.maxResults ?? 10;
        const query = [
            instance.promptDecode?.gmailParams?.dateQuery ?? "",
            instance.promptDecode?.gmailParams?.searchQuery ?? ""
        ].filter(Boolean).join(" ");
        // Fetch messages list with retries
        const { data } = await fetchWithRetry(() => gmail.users.messages.list({ userId: "me", maxResults, q: query }));
        const messages = [];
        if (data.messages?.length) {
            const BATCH_SIZE = 10;
            for (let i = 0; i < data.messages.length; i += BATCH_SIZE) {
                const batch = data.messages.slice(i, i + BATCH_SIZE);
                const batchResults = await Promise.all(batch.map(async (msg) => {
                    const msgData = await fetchWithRetry(() => gmail.users.messages.get({ userId: "me", id: msg.id }));
                    const payload = msgData.data.payload;
                    const headers = payload?.headers || [];
                    return {
                        id: msg.id,
                        threadId: msgData.data.threadId,
                        date: headers.find((h) => h.name === "Date")?.value,
                        from: headers.find((h) => h.name === "From")?.value,
                        to: headers.find((h) => h.name === "To")?.value,
                        subject: headers.find((h) => h.name === "Subject")?.value,
                        snippet: msgData.data.snippet || "",
                        aiContent: generateAIContent(payload, msgData.data.snippet ?? ""),
                        body: null,
                    };
                }));
                messages.push(...batchResults);
            }
        }
        // AI Classification
        const aiFilterRules = instance.promptDecode?.aiFilterRules || {};
        if (aiFilterRules && Object.keys(aiFilterRules).length) {
            const classifier = new emailClassifier_1.EmailClassifier();
            await classifier.init();
            const filteredEmails = await classifier.filterEmails(messages, aiFilterRules);
            return res.json({ instanceId, count: filteredEmails.length, messages: filteredEmails });
        }
        res.json({ instanceId, count: messages.length, messages });
    }
    catch (err) {
        console.error("Gmail Pull Error:", err);
        res.status(500).json({ error: "Failed to fetch emails" });
    }
});
// GET /api/gmail/pull/full/:messageId
router.get("/full/:messageId", auth_1.verifyJWT, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userId;
        const gmail = await getAuthorizedGmailClient(userId);
        const msgData = await fetchWithRetry(() => gmail.users.messages.get({ userId: "me", id: messageId, format: "full" }));
        const payload = msgData.data.payload;
        let fullBody = "";
        if (payload?.mimeType === "text/html" && payload.body?.data) {
            fullBody = Buffer.from(payload.body.data, "base64").toString("utf-8");
        }
        else if (payload?.parts?.length) {
            const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
            if (htmlPart?.body?.data) {
                fullBody = Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
            }
        }
        res.json({
            id: msgData.data.id,
            threadId: msgData.data.threadId,
            subject: payload?.headers?.find((h) => h.name === "Subject")?.value,
            from: payload?.headers?.find((h) => h.name === "From")?.value,
            to: payload?.headers?.find((h) => h.name === "To")?.value,
            date: payload?.headers?.find((h) => h.name === "Date")?.value,
            body: fullBody,
        });
    }
    catch (err) {
        console.error("Gmail Full Email Error:", err);
        res.status(500).json({ error: "Failed to fetch full email" });
    }
});
exports.default = router;
