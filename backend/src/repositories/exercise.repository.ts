import { prisma } from "./prismaClient.js";

export function findExerciseByModuleId(moduleId: string) {
  return prisma.exercise.findFirst({
    where: { moduleId, module: { publicationStatus: "published" } },
  });
}

export function findExerciseCompletion(userId: string, exerciseId: string) {
  return prisma.exerciseCompletion.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
  });
}

export function upsertExerciseCompletion(userId: string, exerciseId: string, submittedAnswer: string) {
  return prisma.exerciseCompletion.upsert({
    where: { userId_exerciseId: { userId, exerciseId } },
    update: { submittedAnswer, completedAt: new Date() },
    create: { userId, exerciseId, submittedAnswer },
  });
}

export function findExerciseCompletionsByUserId(userId: string) {
  return prisma.exerciseCompletion.findMany({
    where: { userId },
    select: { exercise: { select: { moduleId: true } } },
  });
}
