import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { registerSchema } from "../schemas/auth.schema.js";
import { AppError } from "./errors.js";
import { validate } from "./validate.js";

function run(body: unknown) {
  const req = { body } as Request;
  const next = vi.fn() as unknown as NextFunction;
  validate(registerSchema)(req, {} as Response, next);
  return { req, next: next as unknown as ReturnType<typeof vi.fn> };
}

describe("validate", () => {
  it("normalise le body et appelle next() quand le schéma passe", () => {
    const { req, next } = run({ email: "  USER@Example.COM ", password: "password123" });

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ email: "user@example.com", password: "password123" });
  });

  it("renvoie une AppError 400 quand le mot de passe est trop court", () => {
    const { next } = run({ email: "user@example.com", password: "short" });

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ status: 400 });
  });

  it("renvoie une AppError 400 quand l'email est absent", () => {
    const { next } = run({ password: "password123" });

    expect(next.mock.calls[0][0]).toMatchObject({ status: 400 });
  });
});
