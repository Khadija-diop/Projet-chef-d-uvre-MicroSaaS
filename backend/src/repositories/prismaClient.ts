import { Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

/**
 * Indique si l'erreur est une violation de contrainte d'unicite (code Prisma P2002),
 * en renvoyant les champs concernes, pour que les services la traduisent en 409
 * sans dependre eux-memes de Prisma.
 */
export function uniqueConstraintFields(error: unknown): string[] | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return null;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.map(String);
  }
  return typeof target === "string" ? [target] : [];
}
