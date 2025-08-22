// apps/api/src/routes/payments/cashfree/cashfreeRoutes.ts
import { Router, Request, Response } from "express";
import { verifyJWT } from "../../../middleware/auth";
import { prisma } from "@skyler-ai/prisma";
import { cashfree } from "./client";
import { purchasePlanForUser } from "../../../utils/creditsPlan";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// STEP 1: Create Order
router.post("/order", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, plan } = req.body;
    if (!plan) return res.status(400).json({ error: "Plan is required" });

    const orderId = `order_${Date.now()}_${req.userId}`;

    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: req.userId!,
        customer_email: "test@example.com", // replace with actual user email
        customer_phone: "9999999999",
      },
      // Optionally, include order_meta, notes, etc
    };

    const order = await cashfree.PGCreateOrder(request);

    // Save transaction in DB as before
    await prisma.transaction.create({
      data: {
        userId: req.userId!,
        amount,
        creditsBought: 0,
        paymentProvider: "Cashfree",
        providerTxnId: orderId,
        status: "pending",
        metadata: order,
        type: "credits_purchase",
      },
    });

    res.json(order);
  } catch (err) {
    console.error("Cashfree Order Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// STEP 2: Webhook (Cashfree notifies payment result)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const event = req.body;

    const orderId = event.data.order.order_id;
    const paymentStatus = event.data.payment.payment_status;

    const status = paymentStatus === "SUCCESS" ? "success" : "failed";

    // Update transaction
    const txn = await prisma.transaction.update({
      where: { providerTxnId: orderId },
      data: {
        status,
        metadata: event,
      },
    });

    // Give credits if success
    if (status === "success") {
      await purchasePlanForUser(txn.userId, "mini"); // TODO: map orderId → plan
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Cashfree Webhook Error:", err);
    res.status(500).send("FAIL");
  }
});

export default router;
