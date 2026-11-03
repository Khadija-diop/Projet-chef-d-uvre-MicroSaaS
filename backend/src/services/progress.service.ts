import type { ProgressStatus } from "@prisma/client";

import { AppError } from "../middlewares/errors.js";
import { findExerciseCompletionsByUserId } from "../repositories/exercise.repository.js";
import { findPublishedModules, publishedModuleExists } from "../repositories/module.repository.js";
import { findProgressByUserId, upsertProgress } from "../repositories/progress.repository.js";
import { findQuizAttemptsByUserId } from "../repositories/quiz.repository.js";

export async function setModuleProgress(userId: string, moduleId: string, status: ProgressStatus) {
  if (!(await publishedModuleExists(moduleId))) {
    throw new AppError(404, "Module introuvable");
  }

  const progress = await upsertProgress(userId, moduleId, status);

  return { moduleId: progress.moduleId, status: progress.status, updatedAt: progress.updatedAt };
}

/**
 * Pourcentage et compteurs calcules a la lecture, pas stockes (cf. docs/SPECS.md section 10) :
 * un module sans ligne progress pour cet utilisateur est considere "todo". Un module dont le
 * quiz ET l'exercice sont completes par l'utilisateur est toujours considere "done" (badge
 * "module termine" de #85), meme sans marquage manuel via POST /api/progress/:moduleId.
 */
export async function getProgressOverview(userId: string) {
  const [modules, progressRows, quizAttempts, exerciseCompletions] = await Promise.all([
    findPublishedModules(),
    findProgressByUserId(userId),
    findQuizAttemptsByUserId(userId),
    findExerciseCompletionsByUserId(userId),
  ]);

  const statusByModuleId = new Map(progressRows.map((row) => [row.moduleId, row.status]));
  const moduleIdsWithQuizAttempt = new Set(quizAttempts.map((attempt) => attempt.quiz.moduleId));
  const moduleIdsWithExerciseCompletion = new Set(
    exerciseCompletions.map((completion) => completion.exercise.moduleId),
  );

  const moduleProgress = modules.map((module) => {
    const hasCompletedQuizAndExercise =
      moduleIdsWithQuizAttempt.has(module.id) && moduleIdsWithExerciseCompletion.has(module.id);

    return {
      id: module.id,
      title: module.title,
      displayOrder: module.displayOrder,
      status: hasCompletedQuizAndExercise ? ("done" as const) : (statusByModuleId.get(module.id) ?? "todo"),
    };
  });

  const totalCount = moduleProgress.length;
  const doneCount = moduleProgress.filter((module) => module.status === "done").length;
  const remainingCount = totalCount - doneCount;
  const percentage = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return { totalCount, doneCount, remainingCount, percentage, modules: moduleProgress };
}
