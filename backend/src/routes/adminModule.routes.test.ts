import { Prisma, type Module } from "@prisma/client";
import argon2 from "argon2";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as moduleRepository from "../repositories/module.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/module.repository.js");
vi.mock("../repositories/user.repository.js");

const mockedModuleRepo = vi.mocked(moduleRepository);
const mockedUserRepo = vi.mocked(userRepository);

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;
type ModuleWithResources = Prisma.ModuleGetPayload<{
  include: { resources: { include: { resource: true } } };
}>;

const moduleId = "11111111-1111-4111-8111-111111111111";
const updatedAt = new Date("2026-11-04T10:00:00.000Z");

function fakeUser(roleCode: "admin" | "learner", passwordHash: string): UserWithRole {
  return {
    id: `user-${roleCode}`,
    email: `${roleCode}@example.com`,
    passwordHash,
    roleId: `role-${roleCode}`,
    role: { id: `role-${roleCode}`, code: roleCode, libelle: roleCode, description: null },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function fakeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: moduleId,
    title: "Git essentiel",
    shortDescription: "Les bases de Git",
    learningObjective: "Savoir versionner son code",
    displayOrder: 1,
    publicationStatus: "published",
    createdAt: new Date(),
    updatedAt,
    ...overrides,
  };
}

function fakeModuleWithResources(overrides: Partial<Module> = {}): ModuleWithResources {
  return { ...fakeModule(overrides), resources: [] };
}

function uniqueViolation(target: string[]) {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: Prisma.prismaVersion.client,
    meta: { target },
  });
}

async function loginAs(roleCode: "admin" | "learner") {
  const passwordHash = await argon2.hash("password123");
  mockedUserRepo.findUserByEmail.mockResolvedValue(fakeUser(roleCode, passwordHash));

  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email: `${roleCode}@example.com`, password: "password123" });
  return agent;
}

// La route de login est limitee a 10 tentatives par fenetre : on ouvre une session par role
// une seule fois pour tout le fichier (le role est lu dans la session, pas en base).
let adminAgent: Awaited<ReturnType<typeof loginAs>>;
let learnerAgent: Awaited<ReturnType<typeof loginAs>>;

beforeAll(async () => {
  adminAgent = await loginAs("admin");
  learnerAgent = await loginAs("learner");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("controle d'acces /api/admin/modules", () => {
  it("renvoie 401 sans session", async () => {
    const response = await request(app).get("/api/admin/modules");

    expect(response.status).toBe(401);
    expect(mockedModuleRepo.findAllModules).not.toHaveBeenCalled();
  });

  it("renvoie 403 pour un compte apprenant, y compris en ecriture", async () => {
    const agent = learnerAgent;

    const list = await agent.get("/api/admin/modules");
    const create = await agent.post("/api/admin/modules").send({ title: "Intrus" });

    expect(list.status).toBe(403);
    expect(create.status).toBe(403);
    expect(mockedModuleRepo.createModule).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/modules", () => {
  it("liste tous les modules, quel que soit leur statut", async () => {
    mockedModuleRepo.findAllModules.mockResolvedValue([
      fakeModule(),
      fakeModule({ id: "module-2", title: "Docker", displayOrder: 2, publicationStatus: "draft" }),
      fakeModule({ id: "module-3", title: "CI/CD", displayOrder: 3, publicationStatus: "hidden" }),
    ]);
    const agent = adminAgent;

    const response = await agent.get("/api/admin/modules");

    expect(response.status).toBe(200);
    expect(response.body.map((module: Module) => module.publicationStatus)).toEqual([
      "published",
      "draft",
      "hidden",
    ]);
    expect(response.body[0]).toEqual({
      id: moduleId,
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      publicationStatus: "published",
      updatedAt: updatedAt.toISOString(),
    });
  });
});

describe("GET /api/admin/modules/:id", () => {
  it("renvoie un module brouillon avec ses ressources", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(fakeModuleWithResources({ publicationStatus: "draft" }));
    const agent = adminAgent;

    const response = await agent.get(`/api/admin/modules/${moduleId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: moduleId, publicationStatus: "draft", resources: [] });
  });

  it("renvoie 404 si le module n'existe pas", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(null);
    const agent = adminAgent;

    const response = await agent.get(`/api/admin/modules/${moduleId}`);

    expect(response.status).toBe(404);
  });

  it("renvoie 400 si l'identifiant n'est pas un UUID", async () => {
    const agent = adminAgent;

    const response = await agent.get("/api/admin/modules/pas-un-uuid");

    expect(response.status).toBe(400);
    expect(mockedModuleRepo.findModuleById).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/modules", () => {
  it("cree un brouillon place en fin de parcours par defaut", async () => {
    mockedModuleRepo.findMaxDisplayOrder.mockResolvedValue(3);
    mockedModuleRepo.createModule.mockResolvedValue(
      fakeModuleWithResources({ title: "Kubernetes", displayOrder: 4, publicationStatus: "draft" }),
    );
    const agent = adminAgent;

    const response = await agent.post("/api/admin/modules").send({ title: "  Kubernetes  " });

    expect(response.status).toBe(201);
    expect(mockedModuleRepo.createModule).toHaveBeenCalledWith({
      title: "Kubernetes",
      shortDescription: "",
      learningObjective: "",
      displayOrder: 4,
      publicationStatus: "draft",
    });
    expect(response.body).toMatchObject({ title: "Kubernetes", displayOrder: 4, publicationStatus: "draft" });
  });

  it("refuse un module sans titre", async () => {
    const agent = adminAgent;

    const response = await agent.post("/api/admin/modules").send({ title: "   " });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Le titre est obligatoire");
    expect(mockedModuleRepo.createModule).not.toHaveBeenCalled();
  });

  it("refuse de creer directement un module publie sans description ni objectif", async () => {
    const agent = adminAgent;

    const response = await agent
      .post("/api/admin/modules")
      .send({ title: "Kubernetes", publicationStatus: "published" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Un module publie doit avoir une description, un objectif pedagogique");
    expect(mockedModuleRepo.createModule).not.toHaveBeenCalled();
  });

  it("refuse les champs inconnus (ex. identifiant force)", async () => {
    const agent = adminAgent;

    const response = await agent.post("/api/admin/modules").send({ title: "Kubernetes", id: moduleId });

    expect(response.status).toBe(400);
    expect(mockedModuleRepo.createModule).not.toHaveBeenCalled();
  });

  it("renvoie 409 si le titre est deja utilise", async () => {
    mockedModuleRepo.findMaxDisplayOrder.mockResolvedValue(3);
    mockedModuleRepo.createModule.mockRejectedValue(uniqueViolation(["title"]));
    const agent = adminAgent;

    const response = await agent.post("/api/admin/modules").send({ title: "Git essentiel" });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Un module porte deja ce titre");
  });
});

describe("PATCH /api/admin/modules/:id", () => {
  it("masque un module publie", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(fakeModuleWithResources());
    mockedModuleRepo.updateModule.mockResolvedValue(fakeModuleWithResources({ publicationStatus: "hidden" }));
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({ publicationStatus: "hidden" });

    expect(response.status).toBe(200);
    expect(mockedModuleRepo.updateModule).toHaveBeenCalledWith(moduleId, { publicationStatus: "hidden" });
    expect(response.body.publicationStatus).toBe("hidden");
  });

  it("publie un brouillon complet", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(fakeModuleWithResources({ publicationStatus: "draft" }));
    mockedModuleRepo.updateModule.mockResolvedValue(fakeModuleWithResources());
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({ publicationStatus: "published" });

    expect(response.status).toBe(200);
  });

  it("refuse de publier un brouillon sans objectif pedagogique", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(
      fakeModuleWithResources({ publicationStatus: "draft", learningObjective: "" }),
    );
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({ publicationStatus: "published" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Un module publie doit avoir un objectif pedagogique");
    expect(mockedModuleRepo.updateModule).not.toHaveBeenCalled();
  });

  it("refuse de vider la description d'un module deja publie", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(fakeModuleWithResources());
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({ shortDescription: " " });

    expect(response.status).toBe(400);
    expect(mockedModuleRepo.updateModule).not.toHaveBeenCalled();
  });

  it("refuse une modification vide", async () => {
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Aucune modification fournie");
  });

  it("refuse un statut de publication inconnu", async () => {
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({ publicationStatus: "archived" });

    expect(response.status).toBe(400);
    expect(mockedModuleRepo.findModuleById).not.toHaveBeenCalled();
  });

  it("renvoie 404 si le module n'existe pas", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(null);
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({ title: "Nouveau titre" });

    expect(response.status).toBe(404);
    expect(mockedModuleRepo.updateModule).not.toHaveBeenCalled();
  });

  it("renvoie 409 si l'ordre d'affichage est deja occupe", async () => {
    mockedModuleRepo.findModuleById.mockResolvedValue(fakeModuleWithResources());
    mockedModuleRepo.updateModule.mockRejectedValue(uniqueViolation(["display_order"]));
    const agent = adminAgent;

    const response = await agent.patch(`/api/admin/modules/${moduleId}`).send({ displayOrder: 2 });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Un autre module occupe deja cet ordre d'affichage");
  });
});
