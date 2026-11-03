import type { NextFunction, Request, Response } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

/** Evite de repeter try/catch { next(error) } dans chaque controleur asynchrone. */
export function asyncHandler(handler: Handler): Handler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
