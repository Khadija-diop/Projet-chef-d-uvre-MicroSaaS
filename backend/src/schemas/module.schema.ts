import { z } from "zod";

export const moduleIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de module invalide"),
});

export const quizAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid("Identifiant de question invalide"),
        choiceId: z.string().uuid("Identifiant de reponse invalide"),
      }),
    )
    .min(1, "Au moins une reponse est requise")
    .max(50, "Trop de reponses"),
});

export const exerciseSubmissionSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, "La reponse ne doit pas etre vide")
    .max(4000, "Reponse trop longue"),
});
