import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

interface AppError extends Error {
  status?: number;
}

const errorHandler = (err: AppError | ZodError, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
    return;
  }
  res.status((err as AppError).status ?? 500).json({ message: err.message ?? "Internal server error" });
};

export default errorHandler;
