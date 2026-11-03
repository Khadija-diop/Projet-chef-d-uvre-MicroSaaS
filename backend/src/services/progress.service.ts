import type { ProgressStatus } from "@prisma/client";

import { AppError } from "../middlewares/errors.js";
import { publishedModuleExists } from "../repositories/module.repository.js";
import { upsertProgress } from "../repositories/progress.repository.js";

export async function setModuleProgress(userId: string, moduleId: string, status: ProgressStatus) {
  if (!(await publishedModuleExists(moduleId))) {
    throw new AppError(404, "Module introuvable");
  }

  const progress = await upsertProgress(userId, moduleId, status);

  return { moduleId: progress.moduleId, status: progress.status, updatedAt: progress.updatedAt };
}
