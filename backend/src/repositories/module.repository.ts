import { prisma } from "./prismaClient.js";

export function findPublishedModules() {
  return prisma.module.findMany({
    where: { publicationStatus: "published" },
    orderBy: { displayOrder: "asc" },
  });
}
