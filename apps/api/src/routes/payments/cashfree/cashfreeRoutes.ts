// apps/api/src/routes/payments/cashfree/cashfreeRoutes.ts
import { Router, Request, Response } from "express";
import { verifyJWT } from "../../../middleware/auth";
import { prisma } from "@skyler-ai/prisma";
import { cashfree } from "./client";
import { purchasePlanForUser } from "../../../utils/creditsPlan";
import { env } from "process";

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// STEP 1: Create Order
router.post("/order", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    let { amount, plan } = req.body;
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (!plan) return res.status(400).json({ error: "Plan is required" });

    const orderId = `order_${Date.now()}_${req.userId}`;

    amount = amount * 87; // conversion of dollars to inr

    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: req.userId!,
        customer_email: "test@example.com", // replace with actual user email
        customer_phone: "9999999999",
      },
      order_meta: {
        notify_url: `${env.NGROK}/api/payments/cashfree/webhook/`,
        return_url: `${env.FRONTEND_URL}/payments/cashfree-return?order_id=${orderId}`
      }
    };

    const orderResponse = await cashfree.PGCreateOrder(request);
    const order = orderResponse.data;

    // 🔹 Attach plan into metadata
    const metadata = {
      ...JSON.parse(JSON.stringify(order)),
      plan,
    };

    // Save transaction in DB as before
    const txn = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        amount,
        creditsBought: 0,
        paymentProvider: "Cashfree",
        providerTxnId: orderId,
        status: "pending",
        currency: "INR",
        metadata, // ✅ includes plan now
        type: "credits_purchase",
      },
    });
    console.log("Created Cashfree transaction order:", txn);
    res.json(order);
  } catch (err) {
    console.error("Cashfree Order Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// STEP 2: Webhook (Cashfree notifies payment result)
// STEP 2: Webhook (Cashfree notifies payment result)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const event = req.body;

    const eventType = event?.type;
    const orderId = event?.data?.order?.order_id;
    const paymentStatus = event?.data?.payment?.payment_status;

    if (!orderId || !eventType) {
      console.log("Ignoring non-payment webhook:", eventType);
      return res.status(200).send("IGNORED");
    }

    // Only care about SUCCESS event
    if (eventType !== "PAYMENT_SUCCESS_WEBHOOK") {
      console.log("Ignoring webhook type:", eventType);
      return res.status(200).send("IGNORED");
    }

    // Fetch transaction
    const txn = await prisma.transaction.findUnique({
      where: { providerTxnId: orderId },
    });

    if (!txn) {
      console.error("Transaction not found:", orderId);
      return res.status(404).send("Transaction not found");
    }

    // Avoid double-processing
    if (txn.status === "success") {
      console.log("Transaction already processed:", orderId);
      return res.status(200).send("ALREADY_PROCESSED");
    }

    // Pull plan back from metadata
    const plan = (txn.metadata as any)?.plan || "mini";

    // Plan config
    const PLANS: Record<string, { credits: number; days: number }> = {
      mini: { credits: 100, days: 30 },
      pro: { credits: 200, days: 30 },
    };
    const creditsBought = PLANS[plan]?.credits || 0;

    // Update user (plan & credits)
    const userData = await purchasePlanForUser(txn.userId, plan);

    // Update transaction
    await prisma.transaction.update({
      where: { providerTxnId: orderId },
      data: {
        status: "success",
        creditsBought,
        metadata: JSON.parse(JSON.stringify(event)), // save raw event
      },
    });

    console.log("Processed payment successfully:", orderId, userData);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Cashfree Webhook Error:", err);
    res.status(500).send("FAIL");
  }
});



router.post("/check-status", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { order_id } = req.body;
    
    if (!order_id) {
      return res.status(400).json({ error: "Order ID required" });
    }
    
    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { 
        providerTxnId: order_id,
        userId: req.userId // Security: only user's own transactions
      },
      include: {
        user: {
          select: {
            creditsRemaining: true,
            planExpirationDate: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ 
        error: "Transaction not found",
        status: "failed"
      });
    }

    const response: any = {
      status: transaction.status,
      orderId: transaction.providerTxnId,
      amount: transaction.amount,
      creditsBought: transaction.creditsBought
    };

    // If successful, include user data for redirect
    if (transaction.status === "success" && transaction.user) {
      response.userData = {
        creditsRemaining: transaction.user.creditsRemaining,
        planExpirationDate: transaction.user.planExpirationDate
      };
    }

    res.json(response);
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ error: "Server error", status: "failed" });
  }
});



export default router;
