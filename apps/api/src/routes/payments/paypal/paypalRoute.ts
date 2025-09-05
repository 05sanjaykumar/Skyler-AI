// apps/api/src/routes/payments/paypal/paypalRoute.ts
import { Router, Request, Response } from "express";
import { createOrder, capturePayment } from "./paypalServices";
import { verifyJWT } from "../../../middleware/auth";
import { prisma } from "@skyler-ai/prisma";
import { purchasePlanForUser } from '../../../utils/creditsPlan';


const router = Router();

interface AuthRequest extends Request {
  userId?: string; // Optional if you want to track user payments
}

// POST /api/paypal/order
router.post("/order", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, plan } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!plan) {
      return res.status(400).json({ error: "Plan is required" });
    }

    const order = await createOrder(amount.toString());

    // Save transaction as pending
    await prisma.transaction.create({
      data: {
        userId: req.userId!,
        amount,
        creditsBought: 0,
        paymentProvider: "PayPal",
        providerTxnId: order.id,
        status: "pending",
        metadata: order,
        type: "credits_purchase",
      },
    });

    res.json(order);
  } catch (error) {
    console.error("PayPal Create Order Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/paypal/capture
router.post("/capture", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, plan } = req.body;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ error: "Invalid orderId" });
    }

    if (!plan) {
      return res.status(400).json({ error: "Plan is required" });
    }

    const capture = await capturePayment(orderId);
    const status = capture.status === "COMPLETED" ? "success" : "failed";

    // Assign credits only if payment succeeded
    let userData = null;
    let creditsBought = 0;

    if (status === "success") {
      userData = await purchasePlanForUser(req.userId!, plan);
      creditsBought = userData.creditsBought;
    }

    // Update transaction with capture result (and creditsBought)
    await prisma.transaction.update({
      where: { providerTxnId: orderId },
      data: {
        status,
        creditsBought,
        metadata: capture,
      },
    });

    res.json({ capture, userData });
  } catch (error) {
    console.error("PayPal Capture Payment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;