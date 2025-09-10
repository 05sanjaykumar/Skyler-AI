"use strict";
// apps/api/src/routes/gmail/gmailSummariser.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const prisma_1 = require("../../../../../packages/prisma/src/client");
// import { applyRulesToEmail } from "../../AI_Services/gmail_AI/applyRulesToEmail";
const groq_summariser_1 = require("../../AI_Services/gmail_AI/groq_summariser");
const router = (0, express_1.Router)();
// /api/gmail/summarise/:id/groq
router.post("/:id/groq", auth_1.verifyJWT, async (req, res) => {
    const userId = req.userId;
    const { emailBody, emailFrom } = req.body;
    console.log("Email body:", emailBody);
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const email = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!email) {
            return res.status(404).json({ error: "Email not found" });
        }
        const instances = await prisma_1.prisma.aIInstance.findMany({
            where: { userId },
            select: { ruleBox: true },
        });
        if (!instances || instances.length === 0) {
            return res.status(404).json({ error: "No instances found" });
        }
        // Collect rules from all instances
        const rules = [];
        instances.forEach((instance, idx) => {
            if (instance.ruleBox) {
                rules.push({ id: `${idx}`, text: instance.ruleBox });
            }
        });
        if (!rules.length) {
            return res.status(400).json({ error: "No rules found in rule box" });
        }
        console.log("From found:", emailFrom);
        // Call the Groq summariser
        const summariser = new groq_summariser_1.GmailSummariser();
        const result = await summariser.summariseEmail(emailBody, emailFrom, rules);
        res.json(result);
    }
    catch (error) {
        console.error("Error summarizing email with Groq:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
