// apps/api/src/routes/payments/paypal/paypalRoute.ts
import { Router, Request, Response } from "express";
import { createOrder, capturePayment } from "./paypalServices";
import { verifyJWT } from "../../../middleware/auth";
import { prisma } from "@skyler-ai/prisma";


const router = Router();

interface AuthRequest extends Request {
  userId?: string; // Optional if you want to track user payments
}

// POST /api/paypal/order
router.post("/order", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const order = await createOrder(amount.toString());
    // Save to DB
    await prisma.transaction.create({
      data: {
        userId: req.userId!,
        amount,
        creditsBought: 0, // fill this later when order completes
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
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ error: "Invalid orderId" });
    }

    const capture = await capturePayment(orderId);

    await prisma.transaction.update({
      where: { providerTxnId: orderId },
      data: {
        status: capture.status === "COMPLETED" ? "success" : "failed",
        metadata: capture,
      },
    });
    res.json(capture);
  } catch (error) {
    console.error("PayPal Capture Payment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
