import { Prisma, type Resource } from "@prisma/client";
import argon2 from "argon2";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as moduleRepository from "../repositories/module.repository.js";
import * as resourceRepository from "../repositories/resource.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { app } from "../app.js";

vi.mock("../repositories/module.repository.js");
vi.mock("../repositories/resource.repository.js");
vi.mock("../repositories/user.repository.js");

const mockedModuleRepo = vi.mocked(moduleRepository);
const mockedResourceRepo = vi.mocked(resourceRepository);
const mockedUserRepo = vi.mocked(userRepository);

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;
type ModuleResourceWithResource = Prisma.ModuleResourceGetPayload<{ include: { resource: true } }>;

const moduleId = "11111111-1111-4111-8111-111111111111";
const resourceId = "22222222-2222-4222-8222-222222222222";
const basePath = `/api/admin/modules/${moduleId}/resources`;

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

function fakeLink(resource: Partial<Resource> = {}, displayOrder = 1): ModuleResourceWithResource {
  return {
    moduleId,
    resourceId,
    displayOrder,
    resource: {
      id: resourceId,
      title: "Documentation Git",
      content: "https://git-scm.com/doc",
      resourceType: "link",
      createdAt: new Date(),
      ...resource,
    },
  };
}

async function loginAs(roleCode: "admin" | "learner") {
  const passwordHash = await argon2.hash("password123");
  mockedUserRepo.findUserByEmail.mockResolvedValue(fakeUser(roleCode, passwordHash));

  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email: `${roleCode}@example.com`, password: "password123" });
  return agent;
}

// Une session par role pour tout le fichier (limite de 10 connexions par fenetre).
let adminAgent: Awaited<ReturnType<typeof loginAs>>;
let learnerAgent: Awaited<ReturnType<typeof loginAs>>;

beforeAll(async () => {
  adminAgent = await loginAs("admin");
  learnerAgent = await loginAs("learner");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("controle d'acces /api/admin/modules/:id/resources", () => {
  it("renvoie 401 sans session", async () => {
    const response = await request(app).post(basePath).send({ title: "x", content: "y", resourceType: "article" });

    expect(response.status).toBe(401);
    expect(mockedResourceRepo.createResourceInModule).not.toHaveBeenCalled();
  });

  it("renvoie 403 pour un compte apprenant, en creation, modification et suppression", async () => {
    const create = await learnerAgent.post(basePath).send({ title: "x", content: "y", resourceType: "article" });
    const update = await learnerAgent.patch(`${basePath}/${resourceId}`).send({ title: "Intrus" });
    const remove = await learnerAgent.delete(`${basePath}/${resourceId}`);

    expect([create.status, update.status, remove.status]).toEqual([403, 403, 403]);
    expect(mockedResourceRepo.createResourceInModule).not.toHaveBeenCalled();
    expect(mockedResourceRepo.updateModuleResource).not.toHaveBeenCalled();
    expect(mockedResourceRepo.detachResourceFromModule).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/modules/:id/resources", () => {
  it("cree une ressource placee en fin de module par defaut", async () => {
    mockedModuleRepo.moduleExists.mockResolvedValue(true);
    mockedResourceRepo.findMaxResourceDisplayOrder.mockResolvedValue(3);
    mockedResourceRepo.createResourceInModule.mockResolvedValue(fakeLink({}, 4));

    const response = await adminAgent
      .post(basePath)
      .send({ title: "  Documentation Git  ", content: "https://git-scm.com/doc", resourceType: "link" });

    expect(response.status).toBe(201);
    expect(mockedResourceRepo.createResourceInModule).toHaveBeenCalledWith(
      moduleId,
      { title: "Documentation Git", content: "https://git-scm.com/doc", resourceType: "link" },
      4,
    );
    expect(response.body).toEqual({
      id: resourceId,
      title: "Documentation Git",
      content: "https://git-scm.com/doc",
      resourceType: "link",
      displayOrder: 4,
    });
  });

  it("respecte l'ordre d'affichage fourni", async () => {
    mockedModuleRepo.moduleExists.mockResolvedValue(true);
    mockedResourceRepo.createResourceInModule.mockResolvedValue(
      fakeLink({ resourceType: "article", content: "## Intro" }, 1),
    );

    const response = await adminAgent
      .post(basePath)
      .send({ title: "Lecon", content: "## Intro", resourceType: "article", displayOrder: 1 });

    expect(response.status).toBe(201);
    expect(mockedResourceRepo.findMaxResourceDisplayOrder).not.toHaveBeenCalled();
    expect(mockedResourceRepo.createResourceInModule).toHaveBeenCalledWith(
      moduleId,
      expect.objectContaining({ resourceType: "article" }),
      1,
    );
  });

  it("renvoie 404 si le module n'existe pas", async () => {
    mockedModuleRepo.moduleExists.mockResolvedValue(false);

    const response = await adminAgent
      .post(basePath)
      .send({ title: "Lecon", content: "## Intro", resourceType: "article" });

    expect(response.status).toBe(404);
    expect(mockedResourceRepo.createResourceInModule).not.toHaveBeenCalled();
  });

  it("refuse une ressource sans titre ni contenu", async () => {
    const response = await adminAgent.post(basePath).send({ title: " ", content: "", resourceType: "article" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/titre est obligatoire/);
    expect(response.body.error).toMatch(/contenu est obligatoire/);
    expect(mockedModuleRepo.moduleExists).not.toHaveBeenCalled();
  });

  it("refuse un type de ressource inconnu", async () => {
    const response = await adminAgent.post(basePath).send({ title: "Podcast", content: "x", resourceType: "podcast" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Type de ressource invalide/);
  });

  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "pas une url"])(
    "refuse un lien dont le contenu n'est pas une URL http(s) : %s",
    async (content) => {
      mockedModuleRepo.moduleExists.mockResolvedValue(true);

      const response = await adminAgent.post(basePath).send({ title: "Piege", content, resourceType: "link" });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/URL http\(s\)/);
      expect(mockedResourceRepo.createResourceInModule).not.toHaveBeenCalled();
    },
  );

  it("refuse les champs inconnus (ex. identifiant force)", async () => {
    const response = await adminAgent
      .post(basePath)
      .send({ id: resourceId, title: "Lecon", content: "## Intro", resourceType: "article" });

    expect(response.status).toBe(400);
  });

  it("renvoie 400 si l'identifiant du module n'est pas un UUID", async () => {
    const response = await adminAgent
      .post("/api/admin/modules/pas-un-uuid/resources")
      .send({ title: "Lecon", content: "## Intro", resourceType: "article" });

    expect(response.status).toBe(400);
    expect(mockedModuleRepo.moduleExists).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/admin/modules/:id/resources/:resourceId", () => {
  it("modifie le titre et l'ordre d'affichage", async () => {
    mockedResourceRepo.findModuleResource.mockResolvedValue(fakeLink());
    mockedResourceRepo.updateModuleResource.mockResolvedValue(fakeLink({ title: "Doc officielle" }, 2));

    const response = await adminAgent.patch(`${basePath}/${resourceId}`).send({ title: "Doc officielle", displayOrder: 2 });

    expect(response.status).toBe(200);
    expect(mockedResourceRepo.updateModuleResource).toHaveBeenCalledWith(
      moduleId,
      resourceId,
      { title: "Doc officielle" },
      2,
    );
    expect(response.body).toMatchObject({ title: "Doc officielle", displayOrder: 2 });
  });

  it("refuse de transformer un article en lien sans fournir d'URL", async () => {
    mockedResourceRepo.findModuleResource.mockResolvedValue(
      fakeLink({ resourceType: "article", content: "## Les commits" }),
    );

    const response = await adminAgent.patch(`${basePath}/${resourceId}`).send({ resourceType: "video" });

    expect(response.status).toBe(400);
    expect(mockedResourceRepo.updateModuleResource).not.toHaveBeenCalled();
  });

  it("accepte de transformer un lien en article avec du texte", async () => {
    mockedResourceRepo.findModuleResource.mockResolvedValue(fakeLink());
    mockedResourceRepo.updateModuleResource.mockResolvedValue(
      fakeLink({ resourceType: "article", content: "## Resume" }),
    );

    const response = await adminAgent
      .patch(`${basePath}/${resourceId}`)
      .send({ resourceType: "article", content: "## Resume" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ resourceType: "article", content: "## Resume" });
  });

  it("refuse une modification vide", async () => {
    const response = await adminAgent.patch(`${basePath}/${resourceId}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Aucune modification/);
  });

  it("renvoie 404 si la ressource n'est pas rattachee a ce module", async () => {
    mockedResourceRepo.findModuleResource.mockResolvedValue(null);

    const response = await adminAgent.patch(`${basePath}/${resourceId}`).send({ title: "Ailleurs" });

    expect(response.status).toBe(404);
    expect(mockedResourceRepo.updateModuleResource).not.toHaveBeenCalled();
  });

  it("renvoie 400 si l'identifiant de ressource n'est pas un UUID", async () => {
    const response = await adminAgent.patch(`${basePath}/pas-un-uuid`).send({ title: "x" });

    expect(response.status).toBe(400);
    expect(mockedResourceRepo.findModuleResource).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/modules/:id/resources/:resourceId", () => {
  it("retire la ressource du module", async () => {
    mockedResourceRepo.findModuleResource.mockResolvedValue(fakeLink());
    mockedResourceRepo.detachResourceFromModule.mockResolvedValue([fakeLink(), { count: 1 }]);

    const response = await adminAgent.delete(`${basePath}/${resourceId}`);

    expect(response.status).toBe(204);
    expect(mockedResourceRepo.detachResourceFromModule).toHaveBeenCalledWith(moduleId, resourceId);
  });

  it("renvoie 404 si la ressource n'est pas rattachee a ce module", async () => {
    mockedResourceRepo.findModuleResource.mockResolvedValue(null);

    const response = await adminAgent.delete(`${basePath}/${resourceId}`);

    expect(response.status).toBe(404);
    expect(mockedResourceRepo.detachResourceFromModule).not.toHaveBeenCalled();
  });
});
