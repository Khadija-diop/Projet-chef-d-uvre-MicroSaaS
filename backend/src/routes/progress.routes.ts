import { Router } from "express";

import { getProgress, updateProgress } from "../controllers/progress.controller.js";
import { validate } from "../middlewares/validate.js";
import { progressParamsSchema, progressStatusSchema } from "../schemas/progress.schema.js";

export const progressRouter = Router();

progressRouter.get("/", getProgress);
progressRouter.post(
  "/:moduleId",
  validate(progressParamsSchema, "params"),
  validate(progressStatusSchema, "body"),
  updateProgress,
);
