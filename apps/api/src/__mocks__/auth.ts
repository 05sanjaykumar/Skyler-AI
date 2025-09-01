// This is a manual Jest mock for verifyJWT
import { Request, Response, NextFunction } from "express";

export const verifyJWT = (req: Request, _res: Response, next: NextFunction) => {
  // Default: inject a fake userId
  (req as any).userId = "test-user-id";
  next();
};
