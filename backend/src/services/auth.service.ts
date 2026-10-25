import argon2 from "argon2";

import { AppError } from "../middlewares/errors.js";
import { createUser, findUserByEmail } from "../repositories/user.repository.js";
import { toRoleCode } from "../types/roles.js";

export async function registerLearner(email: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError(409, "Un compte existe deja avec cet email");
  }

  const hashedPassword = await argon2.hash(password);
  const user = await createUser(email, hashedPassword, "learner");

  return { id: user.id, email: user.email, role: toRoleCode(user.role.code) };
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(401, "Identifiants invalides");
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password);
  if (!passwordMatches) {
    throw new AppError(401, "Identifiants invalides");
  }

  return { id: user.id, email: user.email, role: toRoleCode(user.role.code) };
}
