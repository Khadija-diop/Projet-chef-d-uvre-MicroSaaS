import type { Module } from "@prisma/client";

import { AppError } from "../middlewares/errors.js";
import {
  createModule,
  findAllModules,
  findMaxDisplayOrder,
  findModuleById,
  updateModule,
} from "../repositories/module.repository.js";
import { uniqueConstraintFields } from "../repositories/prismaClient.js";
import type { CreateModuleInput, UpdateModuleInput } from "../schemas/module.schema.js";
import { type ModuleWithResources, toResourceViews } from "./module.service.js";

type ModuleContent = Pick<Module, "title" | "shortDescription" | "learningObjective" | "publicationStatus">;

function toAdminSummary(module: Module) {
  return {
    id: module.id,
    title: module.title,
    shortDescription: module.shortDescription,
    learningObjective: module.learningObjective,
    displayOrder: module.displayOrder,
    publicationStatus: module.publicationStatus,
    updatedAt: module.updatedAt,
  };
}

function toAdminDetail(module: ModuleWithResources) {
  return {
    ...toAdminSummary(module),
    resources: toResourceViews(module.resources),
  };
}

/** Regles de gestion (docs/SPECS.md) : un module publie a un titre, une description et un objectif. */
function assertPublishable(module: ModuleContent): void {
  if (module.publicationStatus !== "published") {
    return;
  }

  const missing = [
    !module.title && "un titre",
    !module.shortDescription && "une description",
    !module.learningObjective && "un objectif pedagogique",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new AppError(400, `Un module publie doit avoir ${missing.join(", ")}`);
  }
}

/** Traduit une violation d'unicite (titre ou ordre d'affichage) en 409, laisse passer le reste. */
function toConflictError(error: unknown): unknown {
  const fields = uniqueConstraintFields(error);
  if (!fields) {
    return error;
  }

  const onTitle = fields.some((field) => field.toLowerCase().includes("title"));
  return new AppError(
    409,
    onTitle ? "Un module porte deja ce titre" : "Un autre module occupe deja cet ordre d'affichage",
  );
}

export async function listAllModules() {
  const modules = await findAllModules();
  return modules.map(toAdminSummary);
}

export async function getModuleForAdmin(id: string) {
  const module = await findModuleById(id);
  if (!module) {
    throw new AppError(404, "Module introuvable");
  }
  return toAdminDetail(module);
}

export async function createModuleAsAdmin(input: CreateModuleInput) {
  assertPublishable(input);

  const displayOrder = input.displayOrder ?? (await findMaxDisplayOrder()) + 1;

  try {
    const module = await createModule({ ...input, displayOrder });
    return toAdminDetail(module);
  } catch (error) {
    throw toConflictError(error);
  }
}

export async function updateModuleAsAdmin(id: string, input: UpdateModuleInput) {
  const existing = await findModuleById(id);
  if (!existing) {
    throw new AppError(404, "Module introuvable");
  }

  // La regle s'applique a l'etat final : publier un brouillon incomplet, ou vider
  // la description d'un module deja publie, sont tous deux refuses.
  assertPublishable({ ...existing, ...input });

  try {
    const module = await updateModule(id, input);
    return toAdminDetail(module);
  } catch (error) {
    throw toConflictError(error);
  }
}
