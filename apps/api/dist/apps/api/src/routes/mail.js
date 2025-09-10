"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/routes/mail.ts
const express_1 = require("express");
const prisma_1 = require("../../../../packages/prisma/src/client");
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const router = (0, express_1.Router)();
// api/mail/waitlist
router.post("/waitlist", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Missing email" });
    }
    try {
        const existing = await prisma_1.prisma.waitlistEntry.findUnique({ where: { email } });
        if (existing) {
            return res.status(200).json({ message: "Already on the waitlist!" });
        }
        const newEntry = await prisma_1.prisma.waitlistEntry.create({
            data: { email },
        });
        return res.status(201).json({ message: "Added to waitlist!", entry: newEntry });
    }
    catch (error) {
        console.error("Waitlist error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// api/mail/contact-us
router.post("/contact-us", async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const newMessage = await prisma_1.prisma.contactUsMessage.create({
            data: { name, email, message },
        });
        await resend.emails.send({
            from: "contact@sanjaybuilds.com", // must be verified in Resend
            to: "contact@sanjaybuilds.com", // your inbox
            replyTo: email, // user's email
            subject: `New Contact Us Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
        });
        return res.status(201).json({ message: "Message sent!", entry: newMessage });
    }
    catch (error) {
        console.error("Contact Us error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
