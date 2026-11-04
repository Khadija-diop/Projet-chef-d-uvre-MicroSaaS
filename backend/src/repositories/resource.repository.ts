import type { Prisma } from "@prisma/client";

import { prisma } from "./prismaClient.js";

type ResourceData = Pick<Prisma.ResourceCreateInput, "title" | "content" | "resourceType">;

function linkKey(moduleId: string, resourceId: string) {
  return { moduleId_resourceId: { moduleId, resourceId } };
}

export function findModuleResource(moduleId: string, resourceId: string) {
  return prisma.moduleResource.findUnique({
    where: linkKey(moduleId, resourceId),
    include: { resource: true },
  });
}

export async function findMaxResourceDisplayOrder(moduleId: string) {
  const result = await prisma.moduleResource.aggregate({
    where: { moduleId },
    _max: { displayOrder: true },
  });
  return result._max.displayOrder ?? 0;
}

/** Cree la ressource et son rattachement au module en une seule ecriture imbriquee. */
export function createResourceInModule(moduleId: string, data: ResourceData, displayOrder: number) {
  return prisma.moduleResource.create({
    data: {
      displayOrder,
      module: { connect: { id: moduleId } },
      resource: { create: data },
    },
    include: { resource: true },
  });
}

/**
 * Le contenu de la ressource est partage entre tous les modules qui la proposent ;
 * l'ordre d'affichage, lui, est propre a ce rattachement.
 */
export function updateModuleResource(
  moduleId: string,
  resourceId: string,
  data: Partial<ResourceData>,
  displayOrder?: number,
) {
  return prisma.moduleResource.update({
    where: linkKey(moduleId, resourceId),
    data: {
      displayOrder,
      resource: Object.keys(data).length > 0 ? { update: data } : undefined,
    },
    include: { resource: true },
  });
}

/**
 * Retire la ressource du module, puis supprime la ressource elle-meme si plus aucun
 * module ne la propose (pas de ressource orpheline), dans une meme transaction.
 */
export function detachResourceFromModule(moduleId: string, resourceId: string) {
  return prisma.$transaction([
    prisma.moduleResource.delete({ where: linkKey(moduleId, resourceId) }),
    prisma.resource.deleteMany({ where: { id: resourceId, modules: { none: {} } } }),
  ]);
}
