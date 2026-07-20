import { Response, NextFunction } from "express";
import { signToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import userRepository from "../repositories/UserRepository";
import { AuthRequest } from "../types";
import { IUserDocument } from "../models/User";

const sendTokens = (res: Response, user: IUserDocument): void => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
  });
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const exists = await userRepository.findByEmail(email);
    if (exists) { res.status(409).json({ message: "Email already in use" }); return; }
    const user = await userRepository.create({ name, email, passwordHash: password });
    sendTokens(res, user);
  } catch (err) { next(err); }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" }); return;
    }
    sendTokens(res, user);
  } catch (err) { next(err); }
};

export const refresh = (req: AuthRequest, res: Response): void => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) { res.status(401).json({ message: "No refresh token" }); return; }
    const decoded = verifyRefreshToken(token);
    res.json({ token: signToken(decoded.id) });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = (_req: AuthRequest, res: Response): void => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

export const getMe = (req: AuthRequest, res: Response): void => {
  res.json(req.user);
};
