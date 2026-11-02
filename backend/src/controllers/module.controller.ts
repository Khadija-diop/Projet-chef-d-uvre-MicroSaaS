import type { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { getPublishedModuleById, listPublishedModules } from "../services/module.service.js";

export const listModules = asyncHandler(async (_req: Request, res: Response) => {
  const modules = await listPublishedModules();
  res.json(modules);
});

export const getModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const module = await getPublishedModuleById(id);
  res.json(module);
});
