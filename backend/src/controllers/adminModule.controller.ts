import type { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { CreateModuleInput, UpdateModuleInput } from "../schemas/module.schema.js";
import {
  createModuleAsAdmin,
  getModuleForAdmin,
  listAllModules,
  updateModuleAsAdmin,
} from "../services/adminModule.service.js";

export const listAdminModules = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await listAllModules());
});

export const getAdminModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  res.json(await getModuleForAdmin(id));
});

export const createAdminModule = asyncHandler(async (req: Request, res: Response) => {
  const module = await createModuleAsAdmin(req.body as CreateModuleInput);
  res.status(201).json(module);
});

export const updateAdminModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  res.json(await updateModuleAsAdmin(id, req.body as UpdateModuleInput));
});
