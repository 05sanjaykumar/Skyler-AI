// apps/api/src/routes/payments/createOrder.ts
import express from "express";
import { createOrder } from "./paypal/createOrder";
import { capturePayment } from "./paypal/capturePayment";

const router = express.Router();

router.post("/order", async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await createOrder(amount);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/capture", async (req, res) => {
  const { orderId } = req.body;
  try {
    const capture = await capturePayment(orderId);
    res.json(capture);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
