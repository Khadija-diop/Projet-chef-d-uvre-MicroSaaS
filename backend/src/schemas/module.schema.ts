import { z } from "zod";

export const moduleIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de module invalide"),
});
