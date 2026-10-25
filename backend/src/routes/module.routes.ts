import { Router } from "express";

import { getModule, listModules } from "../controllers/module.controller.js";
import { validate } from "../middlewares/validate.js";
import { moduleIdParamsSchema } from "../schemas/module.schema.js";

export const moduleRouter = Router();

moduleRouter.get("/", listModules);
moduleRouter.get("/:id", validate(moduleIdParamsSchema, "params"), getModule);
