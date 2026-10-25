import { AppError } from "../middlewares/errors.js";
import { findPublishedModuleById, findPublishedModules } from "../repositories/module.repository.js";

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
    resources: module.resources.map(({ resource, displayOrder }) => ({
      id: resource.id,
      content: resource.content,
      resourceType: resource.resourceType,
      displayOrder,
    })),
  };
}
