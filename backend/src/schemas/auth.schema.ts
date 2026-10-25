import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().max(128, "Le mot de passe ne doit pas depasser 128 caracteres").min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().max(128, "Le mot de passe ne doit pas depasser 128 caracteres").min(1, "Le mot de passe est requis"),
});
