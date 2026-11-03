import type { ProgressStatus } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { setModuleProgress } from "../services/progress.service.js";

export async function updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { moduleId } = req.params as { moduleId: string };
    const { status } = req.body as { status: ProgressStatus };
    const progress = await setModuleProgress(req.session.userId as string, moduleId, status);
    res.json(progress);
  } catch (error) {
    next(error);
  }
}
