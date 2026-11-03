import { z } from "zod";

export const progressParamsSchema = z.object({
  moduleId: z.string().uuid("Identifiant de module invalide"),
});

export const progressStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"], {
    message: "Statut de progression invalide",
  }),
});
