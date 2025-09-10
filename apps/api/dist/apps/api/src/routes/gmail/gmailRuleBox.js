"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/routes/gmail/gmailRuleBox.ts
const express_1 = require("express");
const prisma_1 = require("../../../../../packages/prisma/src/client");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// api/gmail/rulebox/:InstanceId
router.get("/:id", auth_1.verifyJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const instance = await prisma_1.prisma.aIInstance.findUnique({ where: { id } });
        if (!instance || instance.userId !== userId) {
            return res.status(404).json({ error: "Instance not found" });
        }
        res.json({ ruleBox: instance.ruleBox || "" });
    }
    catch (error) {
        console.error("Fetch Rule Box Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
router.post("/:id", auth_1.verifyJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { ruleBox } = req.body;
        const instance = await prisma_1.prisma.aIInstance.findUnique({ where: { id } });
        if (!instance || instance.userId !== userId) {
            return res.status(404).json({ error: "Instance not found" });
        }
        await prisma_1.prisma.aIInstance.update({
            where: { id },
            data: { ruleBox },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Update Rule Box Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
router.delete("/:id", auth_1.verifyJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const instance = await prisma_1.prisma.aIInstance.findUnique({ where: { id } });
        if (!instance || instance.userId !== userId) {
            return res.status(404).json({ error: "Instance not found" });
        }
        await prisma_1.prisma.aIInstance.update({
            where: { id },
            data: { ruleBox: "" },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Delete Rule Box Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
