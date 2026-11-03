import type { ProgressStatus } from "@prisma/client";

import { prisma } from "./prismaClient.js";

export function upsertProgress(userId: string, moduleId: string, status: ProgressStatus) {
  return prisma.progress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: { status },
    create: { userId, moduleId, status },
  });
}

export function findProgressByUserId(userId: string) {
  return prisma.progress.findMany({ where: { userId } });
}
