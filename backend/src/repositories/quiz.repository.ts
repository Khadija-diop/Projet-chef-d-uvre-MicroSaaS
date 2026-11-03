import { prisma } from "./prismaClient.js";

export function findQuizByModuleId(moduleId: string) {
  return prisma.quiz.findFirst({
    where: { moduleId, module: { publicationStatus: "published" } },
    include: {
      questions: {
        orderBy: { displayOrder: "asc" },
        include: { choices: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });
}

export function createQuizAttempt(userId: string, quizId: string, score: number, totalCount: number) {
  return prisma.quizAttempt.create({
    data: { userId, quizId, score, totalCount },
  });
}

export function findQuizAttemptsByUserId(userId: string) {
  return prisma.quizAttempt.findMany({
    where: { userId },
    select: { quiz: { select: { moduleId: true } } },
  });
}
