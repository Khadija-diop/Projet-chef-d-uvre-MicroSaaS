import type { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { getQuizForModule, submitQuizAttempt } from "../services/quiz.service.js";

export const getQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const quiz = await getQuizForModule(id);
  res.json(quiz);
});

export const submitQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { answers } = req.body as { answers: { questionId: string; choiceId: string }[] };
  const result = await submitQuizAttempt(id, req.session.userId as string, answers);
  res.json(result);
});
