"use strict";
// apps/api/src/routes/gmail/gmailPrompt.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../../../../packages/prisma/src/client");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// api/gmail/form/:id/saveForm
router.post("/:id/saveForm", auth_1.verifyJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { details } = req.body; // 🔑 expects { details: {...} }
        const instance = await prisma_1.prisma.aIInstance.findUnique({ where: { id } });
        if (!instance || instance.userId !== req.userId) {
            return res.status(404).json({ error: "Instance not found" });
        }
        const updated = await prisma_1.prisma.aIInstance.update({
            where: { id },
            data: {
                promptDecode: JSON.parse(JSON.stringify(details)),
            }
        });
        res.json(updated.promptDecode);
    }
    catch (error) {
        console.error("Save Form Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
// api/gmail/form/:id/loadForm
router.get("/:id/loadForm", auth_1.verifyJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const instance = await prisma_1.prisma.aIInstance.findUnique({ where: { id } });
        if (!instance || instance.userId !== req.userId) {
            return res.status(404).json({ error: "Instance not found" });
        }
        res.json(instance.promptDecode);
    }
    catch (error) {
        console.error("Load Form Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
