import bcrypt from "bcryptjs";

import { AppError } from "../middlewares/errors.js";
import { createUser, findUserByEmail } from "../repositories/user.repository.js";

const PASSWORD_SALT_ROUNDS = 10;

export async function registerLearner(email: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError(409, "Un compte existe deja avec cet email");
  }

  const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const user = await createUser(email, hashedPassword, "learner");

  return { id: user.id, email: user.email, role: user.role };
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(401, "Identifiants invalides");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError(401, "Identifiants invalides");
  }

  return { id: user.id, email: user.email, role: user.role };
}
