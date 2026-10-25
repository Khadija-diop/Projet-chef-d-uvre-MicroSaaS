import type { NextFunction, Request, Response } from "express";

import { listPublishedModules } from "../services/module.service.js";

export async function listModules(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const modules = await listPublishedModules();
    res.json(modules);
  } catch (error) {
    next(error);
  }
}
