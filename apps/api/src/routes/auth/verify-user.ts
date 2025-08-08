// apps/api/src/routes/auth/verify-user.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@skyler-ai/prisma";

export const verifyUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.hashedPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { hashedPassword: _, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error("Verify User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
