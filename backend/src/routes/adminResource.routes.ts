import { Router } from "express";

import {
  createAdminResource,
  deleteAdminResource,
  updateAdminResource,
} from "../controllers/adminResource.controller.js";
import { validate } from "../middlewares/validate.js";
import { moduleIdParamsSchema } from "../schemas/module.schema.js";
import {
  createResourceSchema,
  moduleResourceParamsSchema,
  updateResourceSchema,
} from "../schemas/resource.schema.js";

// Monte sous /api/admin/modules/:id/resources : requireAuth + requireAdmin sont appliques
// par adminRouter. mergeParams donne acces au :id du module parent.
// La liste des ressources d'un module est deja renvoyee par GET /api/admin/modules/:id.
export const adminResourceRouter = Router({ mergeParams: true });

adminResourceRouter.post(
  "/",
  validate(moduleIdParamsSchema, "params"),
  validate(createResourceSchema, "body"),
  createAdminResource,
);
adminResourceRouter.patch(
  "/:resourceId",
  validate(moduleResourceParamsSchema, "params"),
  validate(updateResourceSchema, "body"),
  updateAdminResource,
);
adminResourceRouter.delete("/:resourceId", validate(moduleResourceParamsSchema, "params"), deleteAdminResource);
