import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as userRepository from "../repositories/user.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/user.repository.js");

const mockedRepo = vi.mocked(userRepository);

function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "learner@example.com",
    passwordHash: "hashed",
    role: "learner",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  it("crée le compte, renvoie 201 et pose le cookie de session", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(null);
    mockedRepo.createUser.mockResolvedValue(fakeUser({ email: "new@example.com" }));

    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "new@example.com", password: "password123" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: "user-1", email: "new@example.com", role: "learner" });
    expect(response.headers["set-cookie"]?.[0]).toMatch(/connect\.sid=/);
  });

  it("renvoie 400 quand la validation échoue", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "x" });

    expect(response.status).toBe(400);
    expect(mockedRepo.createUser).not.toHaveBeenCalled();
  });

  it("renvoie 409 quand l'email existe déjà", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser());

    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "learner@example.com", password: "password123" });

    expect(response.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("renvoie 200 et l'utilisateur avec de bons identifiants", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser({ passwordHash }));

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "learner@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "user-1", email: "learner@example.com", role: "learner" });
  });

  it("renvoie 401 avec un mauvais mot de passe", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser({ passwordHash }));

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "learner@example.com", password: "wrong-password" });

    expect(response.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("renvoie null (200) sans session", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });

  it("renvoie l'utilisateur courant après connexion", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser({ passwordHash }));
    mockedRepo.findUserById.mockResolvedValue(fakeUser({ passwordHash }));

    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "learner@example.com", password: "password123" });

    const response = await agent.get("/api/auth/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "user-1", email: "learner@example.com", role: "learner" });
  });
});

describe("POST /api/auth/logout", () => {
  it("renvoie 204 et efface le cookie", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(204);
    expect(response.headers["set-cookie"]?.[0]).toMatch(/connect\.sid=;/);
  });
});

describe("guards sur les zones protégées", () => {
  it("renvoie 401 sur une route /api inconnue sans session (requireAuth)", async () => {
    const response = await request(app).get("/api/progress/anything");
    expect(response.status).toBe(401);
  });

  it("renvoie 401 sur une route /api/admin sans session", async () => {
    const response = await request(app).get("/api/admin/anything");
    expect(response.status).toBe(401);
  });

  it("renvoie 404 hors du périmètre /api", async () => {
    const response = await request(app).get("/nope");
    expect(response.status).toBe(404);
  });
});
