import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, errorHandler, notFoundHandler } from "./errors.js";

function fakeResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe("notFoundHandler", () => {
  it("transmet une AppError 404 generique", () => {
    const next = vi.fn();

    notFoundHandler({} as Request, fakeResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0]).toMatchObject({ status: 404, message: "Resource not found" });
  });
});

describe("errorHandler", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renvoie le statut et le message d'une AppError, sans logger", () => {
    const res = fakeResponse();

    errorHandler(new AppError(404, "Module introuvable"), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Module introuvable" });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("renvoie 500 et un message generique pour une erreur inattendue, sans exposer son contenu", () => {
    const res = fakeResponse();
    const unexpected = new Error("colonne inexistante dans la table users");

    errorHandler(unexpected, {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    expect(console.error).toHaveBeenCalledWith(unexpected);
  });
});
