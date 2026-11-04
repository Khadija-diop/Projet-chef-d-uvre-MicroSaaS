import type { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { CreateResourceInput, UpdateResourceInput } from "../schemas/resource.schema.js";
import {
  addResourceToModule,
  removeResourceFromModule,
  updateResourceInModule,
} from "../services/adminResource.service.js";

type ModuleResourceParams = { id: string; resourceId: string };

export const createAdminResource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const resource = await addResourceToModule(id, req.body as CreateResourceInput);
  res.status(201).json(resource);
});

export const updateAdminResource = asyncHandler(async (req: Request, res: Response) => {
  const { id, resourceId } = req.params as ModuleResourceParams;
  res.json(await updateResourceInModule(id, resourceId, req.body as UpdateResourceInput));
});

export const deleteAdminResource = asyncHandler(async (req: Request, res: Response) => {
  const { id, resourceId } = req.params as ModuleResourceParams;
  await removeResourceFromModule(id, resourceId);
  res.status(204).end();
});
