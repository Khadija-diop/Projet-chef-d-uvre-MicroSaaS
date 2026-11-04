import type { Resource } from "@prisma/client";

import { AppError } from "../middlewares/errors.js";
import { moduleExists } from "../repositories/module.repository.js";
import {
  createResourceInModule,
  detachResourceFromModule,
  findMaxResourceDisplayOrder,
  findModuleResource,
  updateModuleResource,
} from "../repositories/resource.repository.js";
import {
  type CreateResourceInput,
  type UpdateResourceInput,
  URL_RESOURCE_TYPES,
} from "../schemas/resource.schema.js";
import { type ModuleWithResources, toResourceViews } from "./module.service.js";

type ResourceContent = Pick<Resource, "content" | "resourceType">;

function toResourceView(link: ModuleWithResources["resources"][number]) {
  return toResourceViews([link])[0];
}

/**
 * Le contenu d'une video ou d'un lien est rendu tel quel dans un attribut href cote
 * frontend : seules les URL http(s) sont acceptees, ce qui ecarte notamment `javascript:`.
 */
function assertValidContent({ content, resourceType }: ResourceContent): void {
  if (!URL_RESOURCE_TYPES.has(resourceType)) {
    return;
  }

  let url: URL;
  try {
    url = new URL(content);
  } catch {
    throw new AppError(400, "Le contenu d'une video ou d'un lien doit etre une URL http(s)");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new AppError(400, "Le contenu d'une video ou d'un lien doit etre une URL http(s)");
  }
}

async function findLinkOrThrow(moduleId: string, resourceId: string) {
  const link = await findModuleResource(moduleId, resourceId);
  if (!link) {
    throw new AppError(404, "Ressource introuvable dans ce module");
  }
  return link;
}

export async function addResourceToModule(moduleId: string, input: CreateResourceInput) {
  if (!(await moduleExists(moduleId))) {
    throw new AppError(404, "Module introuvable");
  }

  assertValidContent(input);

  const { displayOrder, ...data } = input;
  const order = displayOrder ?? (await findMaxResourceDisplayOrder(moduleId)) + 1;

  const link = await createResourceInModule(moduleId, data, order);
  return toResourceView(link);
}

export async function updateResourceInModule(moduleId: string, resourceId: string, input: UpdateResourceInput) {
  const existing = await findLinkOrThrow(moduleId, resourceId);

  // La regle s'applique a l'etat final : passer un article en "lien" sans fournir
  // d'URL, ou remplacer l'URL d'une video par du texte, sont tous deux refuses.
  const { displayOrder, ...data } = input;
  assertValidContent({ ...existing.resource, ...data });

  const link = await updateModuleResource(moduleId, resourceId, data, displayOrder);
  return toResourceView(link);
}

export async function removeResourceFromModule(moduleId: string, resourceId: string) {
  await findLinkOrThrow(moduleId, resourceId);
  await detachResourceFromModule(moduleId, resourceId);
}
