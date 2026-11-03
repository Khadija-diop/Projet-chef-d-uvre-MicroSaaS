import type { Prisma } from "@prisma/client";
import argon2 from "argon2";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as exerciseRepository from "../repositories/exercise.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/exercise.repository.js");
vi.mock("../repositories/user.repository.js");

const mockedExerciseRepo = vi.mocked(exerciseRepository);
const mockedUserRepo = vi.mocked(userRepository);

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

const moduleId = "11111111-1111-4111-8111-111111111111";
const exerciseId = "22222222-2222-4222-8222-222222222222";

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

function fakeExercise() {
  return {
    id: exerciseId,
    moduleId,
    prompt: "Cree une branche et commite un changement.",
    modelAnswer: "git checkout -b exercice-git puis git commit -m \"...\"",
    createdAt: new Date(),
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

describe("GET /api/modules/:id/exercise", () => {
  it("renvoie l'enonce sans la reponse modele quand non authentifie", async () => {
    mockedExerciseRepo.findExerciseByModuleId.mockResolvedValue(fakeExercise());

    const response = await request(app).get(`/api/modules/${moduleId}/exercise`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: exerciseId,
      prompt: "Cree une branche et commite un changement.",
      submittedAnswer: null,
      modelAnswer: null,
    });
  });

  it("revele la reponse modele quand l'apprenant a deja soumis la sienne", async () => {
    mockedExerciseRepo.findExerciseByModuleId.mockResolvedValue(fakeExercise());
    mockedExerciseRepo.findExerciseCompletion.mockResolvedValue({
      id: "completion-1",
      userId: "user-1",
      exerciseId,
      submittedAnswer: "git branch puis git commit",
      completedAt: new Date(),
    });
    const agent = await loginAgent();

    const response = await agent.get(`/api/modules/${moduleId}/exercise`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: exerciseId,
      prompt: "Cree une branche et commite un changement.",
      submittedAnswer: "git branch puis git commit",
      modelAnswer: "git checkout -b exercice-git puis git commit -m \"...\"",
    });
  });

  it("renvoie 404 quand le module n'a pas d'exercice", async () => {
    mockedExerciseRepo.findExerciseByModuleId.mockResolvedValue(null);

    const response = await request(app).get(`/api/modules/${moduleId}/exercise`);

    expect(response.status).toBe(404);
  });
});

describe("POST /api/modules/:id/exercise/completions", () => {
  it("renvoie 401 sans session", async () => {
    const response = await request(app)
      .post(`/api/modules/${moduleId}/exercise/completions`)
      .send({ answer: "ma reponse" });

    expect(response.status).toBe(401);
  });

  it("enregistre la soumission et revele la reponse modele", async () => {
    mockedExerciseRepo.findExerciseByModuleId.mockResolvedValue(fakeExercise());
    mockedExerciseRepo.upsertExerciseCompletion.mockResolvedValue({
      id: "completion-1",
      userId: "user-1",
      exerciseId,
      submittedAnswer: "ma reponse",
      completedAt: new Date(),
    });
    const agent = await loginAgent();

    const response = await agent
      .post(`/api/modules/${moduleId}/exercise/completions`)
      .send({ answer: "ma reponse" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      submittedAnswer: "ma reponse",
      modelAnswer: "git checkout -b exercice-git puis git commit -m \"...\"",
    });
    expect(mockedExerciseRepo.upsertExerciseCompletion).toHaveBeenCalledWith("user-1", exerciseId, "ma reponse");
  });

  it("renvoie 400 quand la reponse est vide", async () => {
    const agent = await loginAgent();

    const response = await agent.post(`/api/modules/${moduleId}/exercise/completions`).send({ answer: "" });

    expect(response.status).toBe(400);
    expect(mockedExerciseRepo.upsertExerciseCompletion).not.toHaveBeenCalled();
  });

  it("renvoie 404 quand le module n'a pas d'exercice", async () => {
    mockedExerciseRepo.findExerciseByModuleId.mockResolvedValue(null);
    const agent = await loginAgent();

    const response = await agent
      .post(`/api/modules/${moduleId}/exercise/completions`)
      .send({ answer: "ma reponse" });

    expect(response.status).toBe(404);
  });
});
