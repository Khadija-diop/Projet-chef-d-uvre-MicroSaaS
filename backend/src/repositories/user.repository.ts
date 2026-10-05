import type { RoleCode } from "../types/roles.js";
import { prisma } from "./prismaClient.js";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { role: true } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, include: { role: true } });
}

export function createUser(email: string, hashedPassword: string, roleCode: RoleCode = "learner") {
  return prisma.user.create({
    data: { email, passwordHash: hashedPassword, role: { connect: { code: roleCode } } },
    include: { role: true },
  });
}
