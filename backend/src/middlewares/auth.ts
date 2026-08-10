import type { NextFunction, Request, Response } from "express";

import { AppError } from "./errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    next(new AppError(401, "Authentification requise"));
    return;
  }

  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    next(new AppError(401, "Authentification requise"));
    return;
  }

  if (req.session.role !== "admin") {
    next(new AppError(403, "Acces reserve aux administrateur·rices"));
    return;
  }

  next();
}
