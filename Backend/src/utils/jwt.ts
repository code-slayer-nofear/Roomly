import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

export const signToken = (userId: Types.ObjectId | string): string =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions);

export const signRefreshToken = (userId: Types.ObjectId | string): string =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } as SignOptions);

export const verifyToken = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
