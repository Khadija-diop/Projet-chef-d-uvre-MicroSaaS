import type { UserRole } from "@prisma/client";

import { prisma } from "./prismaClient.js";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(email: string, hashedPassword: string, role: UserRole = "learner") {
  return prisma.user.create({ data: { email, password: hashedPassword, role } });
}
