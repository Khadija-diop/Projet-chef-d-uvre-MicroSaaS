import type { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { getExerciseForModule, submitExercise } from "../services/exercise.service.js";

export const getExercise = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const exercise = await getExerciseForModule(id, req.session.userId);
  res.json(exercise);
});

export const submitExerciseCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { answer } = req.body as { answer: string };
  const result = await submitExercise(id, req.session.userId as string, answer);
  res.json(result);
});
