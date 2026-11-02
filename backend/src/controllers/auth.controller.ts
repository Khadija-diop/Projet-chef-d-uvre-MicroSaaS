import type { NextFunction, Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { findUserById } from "../repositories/user.repository.js";
import { authenticate, registerLearner } from "../services/auth.service.js";

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await registerLearner(email, password);

  req.session.regenerate((error) => {
    if (error) {
      next(error);
      return;
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    res.status(201).json(user);
  });
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await authenticate(email, password);

  req.session.regenerate((error) => {
    if (error) {
      next(error);
      return;
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    res.json(user);
  });
});

export function logout(req: Request, res: Response, next: NextFunction): void {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("connect.sid");
    res.status(204).send();
  });
}

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(200).json(null);
    return;
  }

  const user = await findUserById(req.session.userId);
  if (!user) {
    res.status(200).json(null);
    return;
  }

  res.json({ id: user.id, email: user.email, role: user.role.code });
});
