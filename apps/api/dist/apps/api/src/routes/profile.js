"use strict";
// apps/api/src/routes/profile.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../../../packages/prisma/src/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.verifyJWT, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                image: true,
                creditsRemaining: true,
                planExpirationDate: true,
                transactions: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        paymentProvider: true,
                        currency: true,
                        createdAt: true,
                    },
                },
            },
        });
        return res.json(user);
    }
    catch (error) {
        console.error("Profile API error:", error);
        return res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
