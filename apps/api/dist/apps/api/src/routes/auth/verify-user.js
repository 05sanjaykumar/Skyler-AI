"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../../../packages/prisma/src/client");
const verifyUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Missing credentials" });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.hashedPassword);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const { hashedPassword: _, ...safeUser } = user;
        res.status(200).json(safeUser);
    }
    catch (error) {
        console.error("Verify User Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.verifyUser = verifyUser;
