import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { AppError } from "./errors.js";

type RequestPart = "body" | "params" | "query";

export function validate(schema: ZodType, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(new AppError(400, result.error.issues.map((issue) => issue.message).join(", ")));
      return;
    }

    req[part] = result.data;
    next();
  };
}
