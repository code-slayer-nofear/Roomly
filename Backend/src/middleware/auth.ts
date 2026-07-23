import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken, verifyRefreshToken, signToken } from "../utils/jwt";
import userRepository from "../repositories/UserRepository";
import { AuthRequest } from "../types";

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const decoded = verifyToken(authHeader.split(" ")[1]);
    const user = await userRepository.findById(decoded.id);
    if (!user) { res.status(401).json({ message: "User not found" }); return; }
    req.user = user;
    next();
  } catch (err) {
    // Access token expired — attempt silent refresh via cookie
    if (err instanceof jwt.TokenExpiredError) {
      try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) { res.status(401).json({ message: "Token expired, please log in again" }); return; }
        const decoded = verifyRefreshToken(refreshToken);
        const user = await userRepository.findById(decoded.id);
        if (!user) { res.status(401).json({ message: "User not found" }); return; }
        const newToken = signToken(user._id);
        res.setHeader("X-New-Token", newToken);
        req.user = user;
        next();
      } catch {
        res.status(401).json({ message: "Session expired, please log in again" });
      }
      return;
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!roles.some((r) => req.user?.role.includes(r))) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
