import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { AppError } from "./errors.js";
import { requireAdmin, requireAuth } from "./auth.js";

type SessionShape = { userId?: string; role?: "learner" | "admin" };

function run(
  middleware: (req: Request, res: Response, next: NextFunction) => void,
  session: SessionShape,
) {
  const req = { session } as unknown as Request;
  const next = vi.fn() as unknown as NextFunction;
  middleware(req, {} as Response, next);
  return next as unknown as ReturnType<typeof vi.fn>;
}

describe("requireAuth", () => {
  it("laisse passer une session authentifiée", () => {
    const next = run(requireAuth, { userId: "user-1", role: "learner" });
    expect(next).toHaveBeenCalledWith();
  });

  it("renvoie une AppError 401 sans session", () => {
    const next = run(requireAuth, {});
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ status: 401 });
  });
});

describe("requireAdmin", () => {
  it("laisse passer un admin", () => {
    const next = run(requireAdmin, { userId: "user-1", role: "admin" });
    expect(next).toHaveBeenCalledWith();
  });

  it("renvoie une AppError 401 sans session", () => {
    const next = run(requireAdmin, {});
    expect(next.mock.calls[0][0]).toMatchObject({ status: 401 });
  });

  it("renvoie une AppError 403 pour un learner", () => {
    const next = run(requireAdmin, { userId: "user-1", role: "learner" });
    expect(next.mock.calls[0][0]).toMatchObject({ status: 403 });
  });
});
