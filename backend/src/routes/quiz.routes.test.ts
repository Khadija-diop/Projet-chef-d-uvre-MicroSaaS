import type { Prisma } from "@prisma/client";
import argon2 from "argon2";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as quizRepository from "../repositories/quiz.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/quiz.repository.js");
vi.mock("../repositories/user.repository.js");

const mockedQuizRepo = vi.mocked(quizRepository);
const mockedUserRepo = vi.mocked(userRepository);

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;
type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: { questions: { include: { choices: true } } };
}>;

const moduleId = "11111111-1111-4111-8111-111111111111";
const quizId = "22222222-2222-4222-8222-222222222222";
const questionId = "33333333-3333-4333-8333-333333333333";
const correctChoiceId = "44444444-4444-4444-8444-444444444444";
const wrongChoiceId = "55555555-5555-4555-8555-555555555555";
const unknownChoiceId = "66666666-6666-4666-8666-666666666666";

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

function fakeQuiz(overrides: Partial<QuizWithQuestions> = {}): QuizWithQuestions {
  return {
    id: quizId,
    moduleId,
    createdAt: new Date(),
    questions: [
      {
        id: questionId,
        quizId,
        prompt: "Quelle commande affiche le contenu d'un dossier ?",
        displayOrder: 1,
        choices: [
          { id: correctChoiceId, questionId, label: "ls", isCorrect: true, displayOrder: 1 },
          { id: wrongChoiceId, questionId, label: "rm", isCorrect: false, displayOrder: 2 },
        ],
      },
    ],
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

describe("GET /api/modules/:id/quiz", () => {
  it("renvoie 200 avec les questions, sans reveler la bonne reponse", async () => {
    mockedQuizRepo.findQuizByModuleId.mockResolvedValue(fakeQuiz());

    const response = await request(app).get(`/api/modules/${moduleId}/quiz`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: quizId,
      questions: [
        {
          id: questionId,
          prompt: "Quelle commande affiche le contenu d'un dossier ?",
          displayOrder: 1,
          choices: [
            { id: correctChoiceId, label: "ls" },
            { id: wrongChoiceId, label: "rm" },
          ],
        },
      ],
    });
    expect(JSON.stringify(response.body)).not.toContain("isCorrect");
  });

  it("renvoie 404 quand le module n'a pas de quiz", async () => {
    mockedQuizRepo.findQuizByModuleId.mockResolvedValue(null);

    const response = await request(app).get(`/api/modules/${moduleId}/quiz`);

    expect(response.status).toBe(404);
  });

  it("est accessible sans authentification", async () => {
    mockedQuizRepo.findQuizByModuleId.mockResolvedValue(fakeQuiz());

    const response = await request(app).get(`/api/modules/${moduleId}/quiz`);

    expect(response.status).not.toBe(401);
  });
});

describe("POST /api/modules/:id/quiz/attempts", () => {
  it("renvoie 401 sans session", async () => {
    const response = await request(app)
      .post(`/api/modules/${moduleId}/quiz/attempts`)
      .send({ answers: [{ questionId, choiceId: correctChoiceId }] });

    expect(response.status).toBe(401);
  });

  it("renvoie le score et les bonnes reponses, et enregistre la tentative", async () => {
    mockedQuizRepo.findQuizByModuleId.mockResolvedValue(fakeQuiz());
    mockedQuizRepo.createQuizAttempt.mockResolvedValue({
      id: "attempt-1",
      userId: "user-1",
      quizId,
      score: 1,
      totalCount: 1,
      completedAt: new Date(),
    });
    const agent = await loginAgent();

    const response = await agent
      .post(`/api/modules/${moduleId}/quiz/attempts`)
      .send({ answers: [{ questionId, choiceId: correctChoiceId }] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      score: 1,
      totalCount: 1,
      results: [{ questionId, correctChoiceId, isCorrect: true }],
    });
    expect(mockedQuizRepo.createQuizAttempt).toHaveBeenCalledWith("user-1", quizId, 1, 1);
  });

  it("compte une reponse fausse comme incorrecte, sans faire echouer la requete", async () => {
    mockedQuizRepo.findQuizByModuleId.mockResolvedValue(fakeQuiz());
    mockedQuizRepo.createQuizAttempt.mockResolvedValue({
      id: "attempt-1",
      userId: "user-1",
      quizId,
      score: 0,
      totalCount: 1,
      completedAt: new Date(),
    });
    const agent = await loginAgent();

    const response = await agent
      .post(`/api/modules/${moduleId}/quiz/attempts`)
      .send({ answers: [{ questionId, choiceId: wrongChoiceId }] });

    expect(response.status).toBe(200);
    expect(response.body.score).toBe(0);
    expect(response.body.results[0]).toEqual({ questionId, correctChoiceId, isCorrect: false });
  });

  it("renvoie 400 quand une reponse ne correspond a aucun choix de la question", async () => {
    mockedQuizRepo.findQuizByModuleId.mockResolvedValue(fakeQuiz());
    const agent = await loginAgent();

    const response = await agent
      .post(`/api/modules/${moduleId}/quiz/attempts`)
      .send({ answers: [{ questionId, choiceId: unknownChoiceId }] });

    expect(response.status).toBe(400);
  });

  it("renvoie 400 sans enregistrer de tentative quand aucune reponse n'est envoyee", async () => {
    const agent = await loginAgent();

    const response = await agent.post(`/api/modules/${moduleId}/quiz/attempts`).send({ answers: [] });

    expect(response.status).toBe(400);
    expect(mockedQuizRepo.createQuizAttempt).not.toHaveBeenCalled();
  });

  it("renvoie 404 quand le module n'a pas de quiz", async () => {
    mockedQuizRepo.findQuizByModuleId.mockResolvedValue(null);
    const agent = await loginAgent();

    const response = await agent
      .post(`/api/modules/${moduleId}/quiz/attempts`)
      .send({ answers: [{ questionId, choiceId: correctChoiceId }] });

    expect(response.status).toBe(404);
  });
});
