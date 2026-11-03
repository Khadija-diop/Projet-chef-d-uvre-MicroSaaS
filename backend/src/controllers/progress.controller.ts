import type { ProgressStatus } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { getProgressOverview, setModuleProgress } from "../services/progress.service.js";

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

export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const overview = await getProgressOverview(req.session.userId as string);
    res.json(overview);
  } catch (error) {
    next(error);
  }
}
