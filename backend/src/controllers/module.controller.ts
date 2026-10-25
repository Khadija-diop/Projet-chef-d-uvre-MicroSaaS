import type { NextFunction, Request, Response } from "express";

import { getPublishedModuleById, listPublishedModules } from "../services/module.service.js";

export async function listModules(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const modules = await listPublishedModules();
    res.json(modules);
  } catch (error) {
    next(error);
  }
}

export async function getModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const module = await getPublishedModuleById(id);
    res.json(module);
  } catch (error) {
    next(error);
  }
}
