import { Router } from "express";
import rateLimit from "express-rate-limit";

import { getExercise, submitExerciseCompletion } from "../controllers/exercise.controller.js";
import { getModule, listModules } from "../controllers/module.controller.js";
import { getQuiz, submitQuiz } from "../controllers/quiz.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { exerciseSubmissionSchema, moduleIdParamsSchema, quizAttemptSchema } from "../schemas/module.schema.js";

export const moduleRouter = Router();

// Chaque soumission ecrit une ligne quiz_attempts / exercise_completions : on borne le debit pour eviter le spam.
const submissionLimiter = rateLimit({
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
  submissionLimiter,
  requireAuth,
  validate(moduleIdParamsSchema, "params"),
  validate(quizAttemptSchema, "body"),
  submitQuiz,
);
moduleRouter.get("/:id/exercise", validate(moduleIdParamsSchema, "params"), getExercise);
moduleRouter.post(
  "/:id/exercise/completions",
  submissionLimiter,
  requireAuth,
  validate(moduleIdParamsSchema, "params"),
  validate(exerciseSubmissionSchema, "body"),
  submitExerciseCompletion,
);
