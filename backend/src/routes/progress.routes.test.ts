import type { Prisma } from "@prisma/client";
import argon2 from "argon2";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as moduleRepository from "../repositories/module.repository.js";
import * as progressRepository from "../repositories/progress.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/module.repository.js");
vi.mock("../repositories/progress.repository.js");
vi.mock("../repositories/user.repository.js");

const mockedModuleRepo = vi.mocked(moduleRepository);
const mockedProgressRepo = vi.mocked(progressRepository);
const mockedUserRepo = vi.mocked(userRepository);

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

const moduleId = "11111111-1111-4111-8111-111111111111";

function fakeUser(overrides: Partial<UserWithRole> = {}): UserWithRole {
  return {
    id: "user-1",
    email: "learner@example.com",
    passwordHash: "hashed",
    roleId: "role-learner",
    role: { id: "role-learner", code: "learner", libelle: "Apprenant", description: null },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

async function loginAgent() {
  const passwordHash = await argon2.hash("password123");
  mockedUserRepo.findUserByEmail.mockResolvedValue(fakeUser({ passwordHash }));

  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email: "learner@example.com", password: "password123" });
  return agent;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/progress/:moduleId", () => {
  it("renvoie 401 sans session", async () => {
    const response = await request(app).post(`/api/progress/${moduleId}`).send({ status: "done" });

    expect(response.status).toBe(401);
  });

  it("enregistre le statut et le renvoie", async () => {
    mockedModuleRepo.publishedModuleExists.mockResolvedValue(true);
    mockedProgressRepo.upsertProgress.mockResolvedValue({
      userId: "user-1",
      moduleId,
      status: "done",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const agent = await loginAgent();

    const response = await agent.post(`/api/progress/${moduleId}`).send({ status: "done" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      moduleId,
      status: "done",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(mockedProgressRepo.upsertProgress).toHaveBeenCalledWith("user-1", moduleId, "done");
  });

  it("peut remettre le statut a todo (marquer a refaire)", async () => {
    mockedModuleRepo.publishedModuleExists.mockResolvedValue(true);
    mockedProgressRepo.upsertProgress.mockResolvedValue({
      userId: "user-1",
      moduleId,
      status: "todo",
      updatedAt: new Date(),
    });
    const agent = await loginAgent();

    const response = await agent.post(`/api/progress/${moduleId}`).send({ status: "todo" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("todo");
  });

  it("renvoie 400 pour un statut invalide", async () => {
    const agent = await loginAgent();

    const response = await agent.post(`/api/progress/${moduleId}`).send({ status: "archived" });

    expect(response.status).toBe(400);
    expect(mockedProgressRepo.upsertProgress).not.toHaveBeenCalled();
  });

  it("renvoie 400 quand l'identifiant de module n'est pas un UUID valide", async () => {
    const agent = await loginAgent();

    const response = await agent.post("/api/progress/not-a-uuid").send({ status: "done" });

    expect(response.status).toBe(400);
  });

  it("renvoie 404 quand le module n'existe pas ou n'est pas publie", async () => {
    mockedModuleRepo.publishedModuleExists.mockResolvedValue(false);
    const agent = await loginAgent();

    const response = await agent.post(`/api/progress/${moduleId}`).send({ status: "done" });

    expect(response.status).toBe(404);
    expect(mockedProgressRepo.upsertProgress).not.toHaveBeenCalled();
  });
});
