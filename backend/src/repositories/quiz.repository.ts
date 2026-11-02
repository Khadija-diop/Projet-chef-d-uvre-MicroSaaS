import { prisma } from "./prismaClient.js";

export function findQuizByModuleId(moduleId: string) {
  return prisma.quiz.findUnique({
    where: { moduleId },
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
