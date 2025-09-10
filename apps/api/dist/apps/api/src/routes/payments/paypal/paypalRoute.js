"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/routes/payments/paypal/paypalRoute.ts
const express_1 = require("express");
const paypalServices_1 = require("./paypalServices");
const auth_1 = require("../../../middleware/auth");
const prisma_1 = require("../../../../../../packages/prisma/src/client");
const creditsPlan_1 = require("../../../utils/creditsPlan");
const router = (0, express_1.Router)();
// POST /api/paypal/order
router.post("/order", auth_1.verifyJWT, async (req, res) => {
    try {
        const { amount, plan } = req.body;
        if (!amount || typeof amount !== "number") {
            return res.status(400).json({ error: "Invalid amount" });
        }
        if (!plan) {
            return res.status(400).json({ error: "Plan is required" });
        }
        const order = await (0, paypalServices_1.createOrder)(amount.toString());
        // Save transaction as pending
        await prisma_1.prisma.transaction.create({
            data: {
                userId: req.userId,
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
    }
    catch (error) {
        console.error("PayPal Create Order Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
// POST /api/paypal/capture
router.post("/capture", auth_1.verifyJWT, async (req, res) => {
    try {
        const { orderId, plan } = req.body;
        if (!orderId || typeof orderId !== "string") {
            return res.status(400).json({ error: "Invalid orderId" });
        }
        if (!plan) {
            return res.status(400).json({ error: "Plan is required" });
        }
        const capture = await (0, paypalServices_1.capturePayment)(orderId);
        const status = capture.status === "COMPLETED" ? "success" : "failed";
        // Assign credits only if payment succeeded
        let userData = null;
        let creditsBought = 0;
        if (status === "success") {
            userData = await (0, creditsPlan_1.purchasePlanForUser)(req.userId, plan);
            creditsBought = userData.creditsBought;
        }
        // Update transaction with capture result (and creditsBought)
        await prisma_1.prisma.transaction.update({
            where: { providerTxnId: orderId },
            data: {
                status,
                creditsBought,
                metadata: capture,
            },
        });
        res.json({ capture, userData });
    }
    catch (error) {
        console.error("PayPal Capture Payment Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
