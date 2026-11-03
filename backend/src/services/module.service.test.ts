import type { Module, Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../middlewares/errors.js";
import * as moduleRepository from "../repositories/module.repository.js";
import { getPublishedModuleById, listPublishedModules } from "./module.service.js";

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
          title: "Documentation officielle Git",
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

describe("listPublishedModules", () => {
  it("ne renvoie que les champs resumes, sans les ressources", async () => {
    mockedRepo.findPublishedModules.mockResolvedValue([
      fakeModule({ id: "module-1", displayOrder: 2 }),
      fakeModule({ id: "module-2", displayOrder: 1, title: "CI/CD" }),
    ]);

    const result = await listPublishedModules();

    expect(result).toEqual([
      {
        id: "module-1",
        title: "Git essentiel",
        shortDescription: "Les bases de Git",
        learningObjective: "Savoir versionner son code",
        displayOrder: 2,
      },
      {
        id: "module-2",
        title: "CI/CD",
        shortDescription: "Les bases de Git",
        learningObjective: "Savoir versionner son code",
        displayOrder: 1,
      },
    ]);
    expect(result[0]).not.toHaveProperty("resources");
  });

  it("renvoie un tableau vide quand aucun module n'est publie", async () => {
    mockedRepo.findPublishedModules.mockResolvedValue([]);

    await expect(listPublishedModules()).resolves.toEqual([]);
  });
});

describe("getPublishedModuleById", () => {
  it("leve une AppError 404 quand le module n'existe pas ou n'est pas publie", async () => {
    mockedRepo.findPublishedModuleById.mockResolvedValue(null);

    await expect(getPublishedModuleById("missing")).rejects.toBeInstanceOf(AppError);
    await expect(getPublishedModuleById("missing")).rejects.toMatchObject({ status: 404 });
  });

  it("aplatit les ressources triees avec leur display_order propre a la liaison", async () => {
    mockedRepo.findPublishedModuleById.mockResolvedValue(
      fakeModuleWithResources({
        resources: [
          {
            moduleId: "module-1",
            resourceId: "resource-1",
            displayOrder: 2,
            resource: {
              id: "resource-1",
              title: "Documentation officielle Git",
              content: "https://git-scm.com/doc",
              resourceType: "link",
              createdAt: new Date(),
            },
          },
        ],
      }),
    );

    const result = await getPublishedModuleById("module-1");

    expect(result).toEqual({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        {
          id: "resource-1",
          title: "Documentation officielle Git",
          content: "https://git-scm.com/doc",
          resourceType: "link",
          displayOrder: 2,
        },
      ],
    });
  });
});
