import { z } from "zod";

export const moduleIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de module invalide"),
});

export const quizAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid("Identifiant de question invalide"),
      choiceId: z.string().uuid("Identifiant de reponse invalide"),
    }),
  ),
});
