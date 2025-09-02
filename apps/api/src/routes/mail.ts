// apps/api/src/routes/mail.ts
import { Router, Request, Response } from "express";
import { prisma } from "@skyler-ai/prisma";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// api/mail/waitlist
router.post("/waitlist", async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
    if (existing) {
      return res.status(200).json({ message: "Already on the waitlist!" });
    }

    const newEntry = await prisma.waitlistEntry.create({
      data: { email },
    });

    return res.status(201).json({ message: "Added to waitlist!", entry: newEntry });
  } catch (error) {
    console.error("Waitlist error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// api/mail/contact-us
router.post("/contact-us", async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newMessage = await prisma.contactUsMessage.create({
      data: { name, email, message },
    });

    
    await resend.emails.send({
      from: "contact@sanjaybuilds.com", // must be verified in Resend
      to: "contact@sanjaybuilds.com",           // your inbox
      replyTo: email,                           // user's email
      subject: `New Contact Us Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });


    return res.status(201).json({ message: "Message sent!", entry: newMessage });
  } catch (error) {
    console.error("Contact Us error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
