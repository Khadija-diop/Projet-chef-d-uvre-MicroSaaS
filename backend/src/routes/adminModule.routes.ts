import { Router } from "express";

import {
  createAdminModule,
  getAdminModule,
  listAdminModules,
  updateAdminModule,
} from "../controllers/adminModule.controller.js";
import { validate } from "../middlewares/validate.js";
import { createModuleSchema, moduleIdParamsSchema, updateModuleSchema } from "../schemas/module.schema.js";

// Monte sous /api/admin/modules : requireAuth + requireAdmin sont appliques par adminRouter.
// Pas de suppression : masquer un module (publicationStatus = "hidden") le retire du parcours
// sans effacer la progression des apprenant·es qui s'y rattache.
export const adminModuleRouter = Router();

adminModuleRouter.get("/", listAdminModules);
adminModuleRouter.get("/:id", validate(moduleIdParamsSchema, "params"), getAdminModule);
adminModuleRouter.post("/", validate(createModuleSchema, "body"), createAdminModule);
adminModuleRouter.patch(
  "/:id",
  validate(moduleIdParamsSchema, "params"),
  validate(updateModuleSchema, "body"),
  updateAdminModule,
);
