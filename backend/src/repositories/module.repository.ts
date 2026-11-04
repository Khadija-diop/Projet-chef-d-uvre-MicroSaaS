import type { Prisma } from "@prisma/client";

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

export async function publishedModuleExists(id: string) {
  const module = await prisma.module.findFirst({
    where: { id, publicationStatus: "published" },
    select: { id: true },
  });

  return module !== null;
}

// --- Administration : tous statuts de publication confondus ---

const moduleWithResources = {
  resources: {
    orderBy: { displayOrder: "asc" },
    include: { resource: true },
  },
} satisfies Prisma.ModuleInclude;

export function findAllModules() {
  return prisma.module.findMany({ orderBy: { displayOrder: "asc" } });
}

export function findModuleById(id: string) {
  return prisma.module.findUnique({ where: { id }, include: moduleWithResources });
}

export async function findMaxDisplayOrder() {
  const result = await prisma.module.aggregate({ _max: { displayOrder: true } });
  return result._max.displayOrder ?? 0;
}

export function createModule(data: Prisma.ModuleCreateInput) {
  return prisma.module.create({ data, include: moduleWithResources });
}

export function updateModule(id: string, data: Prisma.ModuleUpdateInput) {
  return prisma.module.update({ where: { id }, data, include: moduleWithResources });
}
