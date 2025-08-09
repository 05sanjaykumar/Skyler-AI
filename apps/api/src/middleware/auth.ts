// apps/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request type to add userId
interface JwtRequest extends Request {
  userId?: string;
}

export function verifyJWT(req: JwtRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    // decoded is usually an object, let's assert its shape
    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      req.userId = (decoded as { id: string }).id;
      next();
    } else {
      return res.status(403).json({ error: "Invalid token payload" });
    }
  });
}
