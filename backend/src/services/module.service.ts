import { findPublishedModules } from "../repositories/module.repository.js";

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
