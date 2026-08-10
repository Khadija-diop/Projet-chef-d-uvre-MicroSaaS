import type { NextFunction, Request, Response } from "express";

import { findUserById } from "../repositories/user.repository.js";
import { authenticate, registerLearner } from "../services/auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await registerLearner(email, password);

    req.session.userId = user.id;
    req.session.role = user.role;

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await authenticate(email, password);

    req.session.userId = user.id;
    req.session.role = user.role;

    res.json(user);
  } catch (error) {
    next(error);
  }
}

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

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.session.userId) {
      res.status(200).json(null);
      return;
    }

    const user = await findUserById(req.session.userId);
    if (!user) {
      res.status(200).json(null);
      return;
    }

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
}
