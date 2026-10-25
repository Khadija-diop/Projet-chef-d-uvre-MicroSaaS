import type { Module } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as moduleRepository from "../repositories/module.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/module.repository.js");

const mockedRepo = vi.mocked(moduleRepository);

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
