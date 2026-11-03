import { Router } from "express";

import { updateProgress } from "../controllers/progress.controller.js";
import { validate } from "../middlewares/validate.js";
import { progressParamsSchema, progressStatusSchema } from "../schemas/progress.schema.js";

export const progressRouter = Router();

progressRouter.post(
  "/:moduleId",
  validate(progressParamsSchema, "params"),
  validate(progressStatusSchema, "body"),
  updateProgress,
);
