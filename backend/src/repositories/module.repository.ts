import { prisma } from "./prismaClient.js";

export function findPublishedModules() {
  return prisma.module.findMany({
    where: { publicationStatus: "published" },
    orderBy: { displayOrder: "asc" },
  });
}

export function findPublishedModuleById(id: string) {
  return prisma.module.findFirst({
    where: { id, publicationStatus: "published" },
    include: {
      resources: {
        orderBy: { displayOrder: "asc" },
        include: { resource: true },
      },
    },
  });
}
