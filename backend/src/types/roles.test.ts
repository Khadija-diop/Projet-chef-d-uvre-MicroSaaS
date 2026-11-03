import { describe, expect, it } from "vitest";

import { toRoleCode } from "./roles.js";

describe("toRoleCode", () => {
  it("accepte les codes de role connus", () => {
    expect(toRoleCode("learner")).toBe("learner");
    expect(toRoleCode("admin")).toBe("admin");
  });

  it("leve une erreur pour un code de role inconnu en base", () => {
    expect(() => toRoleCode("superadmin")).toThrow("Unknown role code: superadmin");
  });
});
