import type { Module, Prisma } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as moduleRepository from "../repositories/module.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/module.repository.js");

const mockedRepo = vi.mocked(moduleRepository);

type ModuleWithResources = Prisma.ModuleGetPayload<{
  include: { resources: { include: { resource: true } } };
}>;

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

function fakeModuleWithResources(overrides: Partial<ModuleWithResources> = {}): ModuleWithResources {
  return {
    ...fakeModule(),
    resources: [
      {
        moduleId: "module-1",
        resourceId: "resource-1",
        displayOrder: 1,
        resource: {
          id: "resource-1",
          content: "https://git-scm.com/doc",
          resourceType: "link",
          createdAt: new Date(),
        },
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/modules", () => {
  it("renvoie 200 et les modules tries par display_order", async () => {
    mockedRepo.findPublishedModules.mockResolvedValue([
      fakeModule({ id: "module-1", displayOrder: 1 }),
      fakeModule({ id: "module-2", displayOrder: 2, title: "CI/CD" }),
    ]);

    const response = await request(app).get("/api/modules");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: "module-1",
        title: "Git essentiel",
        shortDescription: "Les bases de Git",
        learningObjective: "Savoir versionner son code",
        displayOrder: 1,
      },
      {
        id: "module-2",
        title: "CI/CD",
        shortDescription: "Les bases de Git",
        learningObjective: "Savoir versionner son code",
        displayOrder: 2,
      },
    ]);
  });

  it("renvoie une liste vide quand aucun module n'est publie", async () => {
    mockedRepo.findPublishedModules.mockResolvedValue([]);

    const response = await request(app).get("/api/modules");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("est accessible sans authentification", async () => {
    mockedRepo.findPublishedModules.mockResolvedValue([]);

    const response = await request(app).get("/api/modules");

    expect(response.status).not.toBe(401);
  });
});

describe("GET /api/modules/:id", () => {
  const moduleId = "11111111-1111-4111-8111-111111111111";

  it("renvoie 200 avec le module et ses ressources triees", async () => {
    mockedRepo.findPublishedModuleById.mockResolvedValue(fakeModuleWithResources({ id: moduleId }));

    const response = await request(app).get(`/api/modules/${moduleId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: moduleId,
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        {
          id: "resource-1",
          content: "https://git-scm.com/doc",
          resourceType: "link",
          displayOrder: 1,
        },
      ],
    });
  });

  it("renvoie 404 quand le module n'existe pas ou n'est pas publie", async () => {
    mockedRepo.findPublishedModuleById.mockResolvedValue(null);

    const response = await request(app).get(`/api/modules/${moduleId}`);

    expect(response.status).toBe(404);
  });

  it("renvoie 400 quand l'identifiant n'est pas un UUID valide", async () => {
    const response = await request(app).get("/api/modules/not-a-uuid");

    expect(response.status).toBe(400);
    expect(mockedRepo.findPublishedModuleById).not.toHaveBeenCalled();
  });
});
