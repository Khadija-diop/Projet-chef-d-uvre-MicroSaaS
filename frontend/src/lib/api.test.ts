import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, login, logout, register } from "./api";

const API_URL = "http://localhost:3001";

function jsonResponse(body: unknown, init: { status?: number } = {}): Response {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("login", () => {
  it("POST /api/auth/login avec le corps JSON et les cookies inclus", async () => {
    const user = { id: "u1", email: "learner@example.com", role: "learner" };
    fetchMock.mockResolvedValue(jsonResponse(user));

    const result = await login("learner@example.com", "password123");

    expect(result).toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/auth/login`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "learner@example.com", password: "password123" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("lève le message d'erreur renvoyé par l'API sur une réponse non ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Identifiants invalides" }, { status: 401 }));

    await expect(login("learner@example.com", "wrong")).rejects.toThrow("Identifiants invalides");
  });

  it("lève un message générique quand le corps d'erreur est illisible", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
    } as unknown as Response);

    await expect(login("learner@example.com", "x")).rejects.toThrow("Une erreur est survenue");
  });
});

describe("register", () => {
  it("POST /api/auth/register et retourne l'utilisateur créé", async () => {
    const user = { id: "u2", email: "new@example.com", role: "learner" };
    fetchMock.mockResolvedValue(jsonResponse(user, { status: 201 }));

    await expect(register("new@example.com", "password123")).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/auth/register`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("logout", () => {
  it("retourne undefined sur un 204 sans parser le corps", async () => {
    const json = vi.fn();
    fetchMock.mockResolvedValue({ ok: true, status: 204, json } as unknown as Response);

    await expect(logout()).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });
});

describe("getCurrentUser", () => {
  it("GET /api/auth/me et retourne l'utilisateur courant", async () => {
    const user = { id: "u1", email: "learner@example.com", role: "admin" };
    fetchMock.mockResolvedValue(jsonResponse(user));

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/auth/me`,
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
