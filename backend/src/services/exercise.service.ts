import { AppError } from "../middlewares/errors.js";
import {
  findExerciseByModuleId,
  findExerciseCompletion,
  upsertExerciseCompletion,
} from "../repositories/exercise.repository.js";

async function findExerciseOrThrow(moduleId: string) {
  const exercise = await findExerciseByModuleId(moduleId);
  if (!exercise) {
    throw new AppError(404, "Aucun exercice pour ce module");
  }

  return exercise;
}

/**
 * La reponse modele reste masquee tant que l'apprenant n'a pas soumis la sienne
 * (auto-correction par comparaison, pas d'execution de code en sandbox pour le moment).
 */
export async function getExerciseForModule(moduleId: string, userId: string | undefined) {
  const exercise = await findExerciseOrThrow(moduleId);
  const completion = userId ? await findExerciseCompletion(userId, exercise.id) : null;

  return {
    id: exercise.id,
    prompt: exercise.prompt,
    submittedAnswer: completion?.submittedAnswer ?? null,
    modelAnswer: completion ? exercise.modelAnswer : null,
  };
}

export async function submitExercise(moduleId: string, userId: string, answer: string) {
  const exercise = await findExerciseOrThrow(moduleId);
  await upsertExerciseCompletion(userId, exercise.id, answer);

  return { submittedAnswer: answer, modelAnswer: exercise.modelAnswer };
}
