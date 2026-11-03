import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../middlewares/errors.js";
import * as moduleRepository from "../repositories/module.repository.js";
import * as progressRepository from "../repositories/progress.repository.js";
import { getProgressOverview, setModuleProgress } from "./progress.service.js";

vi.mock("../repositories/module.repository.js");
vi.mock("../repositories/progress.repository.js");

const mockedModuleRepo = vi.mocked(moduleRepository);
const mockedProgressRepo = vi.mocked(progressRepository);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("setModuleProgress", () => {
  it("leve une AppError 404 quand le module n'existe pas ou n'est pas publie", async () => {
    mockedModuleRepo.publishedModuleExists.mockResolvedValue(false);

    await expect(setModuleProgress("user-1", "module-1", "done")).rejects.toBeInstanceOf(AppError);
    await expect(setModuleProgress("user-1", "module-1", "done")).rejects.toMatchObject({ status: 404 });
    expect(mockedProgressRepo.upsertProgress).not.toHaveBeenCalled();
  });

  it("enregistre le statut via le repository et renvoie la forme attendue", async () => {
    mockedModuleRepo.publishedModuleExists.mockResolvedValue(true);
    const updatedAt = new Date("2026-01-01T00:00:00.000Z");
    mockedProgressRepo.upsertProgress.mockResolvedValue({
      userId: "user-1",
      moduleId: "module-1",
      status: "done",
      updatedAt,
    });

    const result = await setModuleProgress("user-1", "module-1", "done");

    expect(mockedProgressRepo.upsertProgress).toHaveBeenCalledWith("user-1", "module-1", "done");
    expect(result).toEqual({ moduleId: "module-1", status: "done", updatedAt });
  });
});

describe("getProgressOverview", () => {
  it("considere todo un module sans ligne progress pour cet utilisateur", async () => {
    mockedModuleRepo.findPublishedModules.mockResolvedValue([
      {
        id: "module-1",
        title: "Git essentiel",
        shortDescription: "Les bases de Git",
        learningObjective: "Savoir versionner son code",
        displayOrder: 1,
        publicationStatus: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockedProgressRepo.findProgressByUserId.mockResolvedValue([]);

    const result = await getProgressOverview("user-1");

    expect(result).toEqual({
      totalCount: 1,
      doneCount: 0,
      remainingCount: 1,
      percentage: 0,
      modules: [{ id: "module-1", title: "Git essentiel", displayOrder: 1, status: "todo" }],
    });
  });

  it("calcule un pourcentage arrondi a partir des lignes progress existantes", async () => {
    mockedModuleRepo.findPublishedModules.mockResolvedValue([
      {
        id: "module-1",
        title: "Linux",
        shortDescription: "s",
        learningObjective: "o",
        displayOrder: 1,
        publicationStatus: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "module-2",
        title: "Git",
        shortDescription: "s",
        learningObjective: "o",
        displayOrder: 2,
        publicationStatus: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "module-3",
        title: "Docker",
        shortDescription: "s",
        learningObjective: "o",
        displayOrder: 3,
        publicationStatus: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockedProgressRepo.findProgressByUserId.mockResolvedValue([
      { userId: "user-1", moduleId: "module-1", status: "done", updatedAt: new Date() },
    ]);

    const result = await getProgressOverview("user-1");

    expect(result.totalCount).toBe(3);
    expect(result.doneCount).toBe(1);
    expect(result.remainingCount).toBe(2);
    expect(result.percentage).toBe(33);
  });

  it("renvoie 0% sans erreur quand il n'y a aucun module publie", async () => {
    mockedModuleRepo.findPublishedModules.mockResolvedValue([]);
    mockedProgressRepo.findProgressByUserId.mockResolvedValue([]);

    await expect(getProgressOverview("user-1")).resolves.toEqual({
      totalCount: 0,
      doneCount: 0,
      remainingCount: 0,
      percentage: 0,
      modules: [],
    });
  });
});
