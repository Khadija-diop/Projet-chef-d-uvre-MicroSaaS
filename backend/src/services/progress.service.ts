import type { ProgressStatus } from "@prisma/client";

import { AppError } from "../middlewares/errors.js";
import { findPublishedModules, publishedModuleExists } from "../repositories/module.repository.js";
import { findProgressByUserId, upsertProgress } from "../repositories/progress.repository.js";

export async function setModuleProgress(userId: string, moduleId: string, status: ProgressStatus) {
  if (!(await publishedModuleExists(moduleId))) {
    throw new AppError(404, "Module introuvable");
  }

  const progress = await upsertProgress(userId, moduleId, status);

  return { moduleId: progress.moduleId, status: progress.status, updatedAt: progress.updatedAt };
}

/**
 * Pourcentage et compteurs calcules a la lecture, pas stockes (cf. docs/SPECS.md section 10) :
 * un module sans ligne progress pour cet utilisateur est considere "todo".
 */
export async function getProgressOverview(userId: string) {
  const [modules, progressRows] = await Promise.all([findPublishedModules(), findProgressByUserId(userId)]);

  const statusByModuleId = new Map(progressRows.map((row) => [row.moduleId, row.status]));

  const moduleProgress = modules.map((module) => ({
    id: module.id,
    title: module.title,
    displayOrder: module.displayOrder,
    status: statusByModuleId.get(module.id) ?? "todo",
  }));

  const totalCount = moduleProgress.length;
  const doneCount = moduleProgress.filter((module) => module.status === "done").length;
  const remainingCount = totalCount - doneCount;
  const percentage = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return { totalCount, doneCount, remainingCount, percentage, modules: moduleProgress };
}
