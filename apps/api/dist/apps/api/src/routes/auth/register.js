"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../../../packages/prisma/src/client"); // adjust if alias differs
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
            },
        });
        const { hashedPassword: _, ...safeUser } = user;
        res.status(201).json(safeUser);
    }
    catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.registerUser = registerUser;
