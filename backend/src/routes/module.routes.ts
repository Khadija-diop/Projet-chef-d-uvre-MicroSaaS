import { Router } from "express";

import { getModule, listModules } from "../controllers/module.controller.js";
import { getQuiz, submitQuiz } from "../controllers/quiz.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { moduleIdParamsSchema, quizAttemptSchema } from "../schemas/module.schema.js";

export const moduleRouter = Router();

moduleRouter.get("/", listModules);
moduleRouter.get("/:id", validate(moduleIdParamsSchema, "params"), getModule);
moduleRouter.get("/:id/quiz", validate(moduleIdParamsSchema, "params"), getQuiz);
moduleRouter.post(
  "/:id/quiz/attempts",
  requireAuth,
  validate(moduleIdParamsSchema, "params"),
  validate(quizAttemptSchema, "body"),
  submitQuiz,
);
