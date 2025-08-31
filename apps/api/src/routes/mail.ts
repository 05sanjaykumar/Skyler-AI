// apps/api/src/routes/mail.ts

import { Router, Request, Response } from "express";
import { verifyJWT } from "../middleware/auth";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);


const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// api/mail/waitlist
router.post("/waitlist", verifyJWT, async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  const { email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: "Missing userId or email" });
  }

  try {
    console.log("Creating email for user:", userId, "with email:", email);
  } catch (error) {
    console.error("Error creating email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// api/mail/contact-us
router.post("/contact-us", verifyJWT, async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  const { email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: "Missing userId or email" });
  }

  try {
    console.log("Adding user to contact us list:");
  } catch (error) {
    console.error("Error adding user to contact us list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;