import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  status?: number;
}

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  res.status(err.status ?? 500).json({ message: err.message ?? "Internal server error" });
};

export default errorHandler;
