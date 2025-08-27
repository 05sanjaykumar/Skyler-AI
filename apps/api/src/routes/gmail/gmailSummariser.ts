// apps/api/src/routes/gmail/gmailSummariser.ts

import { Router, Request, Response } from "express";
import { verifyJWT } from "../../middleware/auth";
import { prisma } from "@skyler-ai/prisma";
// import { applyRulesToEmail } from "../../AI_Services/gmail_AI/applyRulesToEmail";
import { GmailSummariser } from "../../AI_Services/gmail_AI/groq_summariser";


const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// router.post("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
//   const userId = req.userId;
//   const { emailBody } = req.body;
//   console.log("Email body:", emailBody);

//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const email = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!email) {
//       return res.status(404).json({ error: "Email not found" });
//     }

//     const instances = await prisma.aIInstance.findMany({
//       where: { userId },
//       select: { ruleBox: true },
//     });

//     if (!instances || instances.length === 0) {
//       return res.status(404).json({ error: "No instances found" });
//     }
//     const rules: { id: string; text: string }[] = [];

//     instances.forEach((instance, idx) => {
//     if (instance.ruleBox) {
//         rules.push({ id: `${idx}`, text: instance.ruleBox });
//       }
//     });

//     if (!rules.length) {
//         return res.status(400).json({ error: "No rules found in rule box" });
//     }
//     console.log("Rules found:", rules);
//     const result = await applyRulesToEmail(emailBody, rules);

//     res.json(result);
//   } catch (error) {
//     console.error("Error summarizing email:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.post("/:id/groq", verifyJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { emailBody, emailFrom } = req.body;
  console.log("Email body:", emailBody);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const email = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    const instances = await prisma.aIInstance.findMany({
      where: { userId },
      select: { ruleBox: true },
    });

    if (!instances || instances.length === 0) {
      return res.status(404).json({ error: "No instances found" });
    }

    // Collect rules from all instances
    const rules: { id: string; text: string }[] = [];
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
    const summariser = new GmailSummariser();
    const result = await summariser.summariseEmail(emailBody,emailFrom, rules);

    res.json(result);
  } catch (error) {
    console.error("Error summarizing email with Groq:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;