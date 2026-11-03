import type { Module, Prisma } from "@prisma/client";
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

function fakeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: "module-1",
    title: "Git essentiel",
    shortDescription: "Les bases de Git",
    learningObjective: "Savoir versionner son code",
    displayOrder: 1,
    publicationStatus: "published",
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

describe("GET /api/progress", () => {
  it("renvoie 401 sans session", async () => {
    const response = await request(app).get("/api/progress");

    expect(response.status).toBe(401);
  });

  it("considere todo les modules sans ligne progress, avec 0% de progression", async () => {
    mockedModuleRepo.findPublishedModules.mockResolvedValue([
      fakeModule({ id: "module-1", displayOrder: 1, title: "Linux" }),
      fakeModule({ id: "module-2", displayOrder: 2, title: "Git" }),
    ]);
    mockedProgressRepo.findProgressByUserId.mockResolvedValue([]);
    const agent = await loginAgent();

    const response = await agent.get("/api/progress");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalCount: 2,
      doneCount: 0,
      remainingCount: 2,
      percentage: 0,
      modules: [
        { id: "module-1", title: "Linux", displayOrder: 1, status: "todo" },
        { id: "module-2", title: "Git", displayOrder: 2, status: "todo" },
      ],
    });
  });

  it("calcule le pourcentage et les compteurs a partir des lignes progress existantes", async () => {
    mockedModuleRepo.findPublishedModules.mockResolvedValue([
      fakeModule({ id: "module-1", displayOrder: 1, title: "Linux" }),
      fakeModule({ id: "module-2", displayOrder: 2, title: "Git" }),
      fakeModule({ id: "module-3", displayOrder: 3, title: "Docker" }),
    ]);
    mockedProgressRepo.findProgressByUserId.mockResolvedValue([
      { userId: "user-1", moduleId: "module-1", status: "done", updatedAt: new Date() },
      { userId: "user-1", moduleId: "module-2", status: "in_progress", updatedAt: new Date() },
    ]);
    const agent = await loginAgent();

    const response = await agent.get("/api/progress");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalCount: 3,
      doneCount: 1,
      remainingCount: 2,
      percentage: 33,
      modules: [
        { id: "module-1", title: "Linux", displayOrder: 1, status: "done" },
        { id: "module-2", title: "Git", displayOrder: 2, status: "in_progress" },
        { id: "module-3", title: "Docker", displayOrder: 3, status: "todo" },
      ],
    });
  });

  it("renvoie 0% sans erreur quand il n'y a aucun module publie", async () => {
    mockedModuleRepo.findPublishedModules.mockResolvedValue([]);
    mockedProgressRepo.findProgressByUserId.mockResolvedValue([]);
    const agent = await loginAgent();

    const response = await agent.get("/api/progress");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalCount: 0,
      doneCount: 0,
      remainingCount: 0,
      percentage: 0,
      modules: [],
    });
  });
});
