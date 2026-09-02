import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../middlewares/errors.js";
import * as userRepository from "../repositories/user.repository.js";
import { authenticate, registerLearner } from "./auth.service.js";

vi.mock("../repositories/user.repository.js");

const mockedRepo = vi.mocked(userRepository);

function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "learner@example.com",
    passwordHash: "hashed",
    role: "learner",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerLearner", () => {
  it("rejette un email déjà utilisé avec un 409", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser());

    await expect(registerLearner("learner@example.com", "password123")).rejects.toMatchObject({
      status: 409,
    });
    expect(mockedRepo.createUser).not.toHaveBeenCalled();
  });

  it("hashe le mot de passe et crée un compte learner", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(null);
    mockedRepo.createUser.mockResolvedValue(fakeUser({ email: "new@example.com" }));

    const result = await registerLearner("new@example.com", "password123");

    expect(mockedRepo.createUser).toHaveBeenCalledTimes(1);
    const [, hashedPassword, role] = mockedRepo.createUser.mock.calls[0];
    expect(hashedPassword).not.toBe("password123");
    expect(await bcrypt.compare("password123", hashedPassword)).toBe(true);
    expect(role).toBe("learner");
    expect(result).toEqual({ id: "user-1", email: "new@example.com", role: "learner" });
    expect(result).not.toHaveProperty("passwordHash");
  });
});

describe("authenticate", () => {
  it("rejette un email inconnu avec un 401", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(null);

    await expect(authenticate("ghost@example.com", "password123")).rejects.toBeInstanceOf(AppError);
    await expect(authenticate("ghost@example.com", "password123")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("rejette un mot de passe invalide avec un 401", async () => {
    const passwordHash = await bcrypt.hash("the-real-password", 10);
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser({ passwordHash }));

    await expect(authenticate("learner@example.com", "wrong-password")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("retourne l'utilisateur (sans le hash) quand les identifiants sont bons", async () => {
    const passwordHash = await bcrypt.hash("the-real-password", 10);
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser({ passwordHash, role: "admin" }));

    const result = await authenticate("learner@example.com", "the-real-password");

    expect(result).toEqual({ id: "user-1", email: "learner@example.com", role: "admin" });
    expect(result).not.toHaveProperty("password");
  });
});
