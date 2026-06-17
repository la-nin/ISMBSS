import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: string;
  };
};

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT secret missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const authReq = req as AuthenticatedRequest;

    authReq.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}
