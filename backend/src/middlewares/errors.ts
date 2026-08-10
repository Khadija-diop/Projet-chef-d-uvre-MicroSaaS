import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "Resource not found"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const status = err instanceof AppError ? err.status : 500;
  const message = err instanceof AppError ? err.message : "Internal server error";

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}
