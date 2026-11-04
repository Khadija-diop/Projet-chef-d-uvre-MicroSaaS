import type { Prisma } from "@prisma/client";

import { AppError } from "../middlewares/errors.js";
import { findPublishedModuleById, findPublishedModules } from "../repositories/module.repository.js";

export type ModuleWithResources = Prisma.ModuleGetPayload<{
  include: { resources: { include: { resource: true } } };
}>;

export async function listPublishedModules() {
  const modules = await findPublishedModules();

  return modules.map((module) => ({
    id: module.id,
    title: module.title,
    shortDescription: module.shortDescription,
    learningObjective: module.learningObjective,
    displayOrder: module.displayOrder,
  }));
}

export async function getPublishedModuleById(id: string) {
  const module = await findPublishedModuleById(id);
  if (!module) {
    throw new AppError(404, "Module introuvable");
  }

  return {
    id: module.id,
    title: module.title,
    shortDescription: module.shortDescription,
    learningObjective: module.learningObjective,
    displayOrder: module.displayOrder,
    resources: toResourceViews(module.resources),
  };
}

/** Forme publique des ressources d'un module (partagee avec l'administration). */
export function toResourceViews(resources: ModuleWithResources["resources"]) {
  return resources.map(({ resource, displayOrder }) => ({
    id: resource.id,
    title: resource.title,
    content: resource.content,
    resourceType: resource.resourceType,
    displayOrder,
  }));
}
