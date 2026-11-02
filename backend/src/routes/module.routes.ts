import { Router } from "express";
import rateLimit from "express-rate-limit";

import { getModule, listModules } from "../controllers/module.controller.js";
import { getQuiz, submitQuiz } from "../controllers/quiz.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { moduleIdParamsSchema, quizAttemptSchema } from "../schemas/module.schema.js";

export const moduleRouter = Router();

// Chaque soumission ecrit une ligne quiz_attempts : on borne le debit pour eviter le spam.
const quizAttemptLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Trop de tentatives, reessayez dans quelques instants" },
});

moduleRouter.get("/", listModules);
moduleRouter.get("/:id", validate(moduleIdParamsSchema, "params"), getModule);
moduleRouter.get("/:id/quiz", validate(moduleIdParamsSchema, "params"), getQuiz);
moduleRouter.post(
  "/:id/quiz/attempts",
  quizAttemptLimiter,
  requireAuth,
  validate(moduleIdParamsSchema, "params"),
  validate(quizAttemptSchema, "body"),
  submitQuiz,
);
