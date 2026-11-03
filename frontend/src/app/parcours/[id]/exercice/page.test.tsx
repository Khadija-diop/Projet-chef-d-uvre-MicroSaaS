import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, getExercise } from "@/lib/api";

import ModuleExercisePage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "module-1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ApiError: actual.ApiError,
    getExercise: vi.fn(),
    submitExercise: vi.fn(),
    logout: vi.fn(),
  };
});

const getExerciseMock = vi.mocked(getExercise);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Page exercice d'un module", () => {
  it("affiche un lien de retour vers le module et l'exercice charge", async () => {
    getExerciseMock.mockResolvedValue({
      id: "exercise-1",
      prompt: "Cree une branche et commite un changement.",
      submittedAnswer: null,
      modelAnswer: null,
    });

    render(<ModuleExercisePage />);

    expect(screen.getByRole("link", { name: /Retour au module/ })).toHaveAttribute("href", "/parcours/module-1");
    expect(await screen.findByText("Cree une branche et commite un changement.")).toBeInTheDocument();
  });

  it("indique que le module n'a pas d'exercice", async () => {
    getExerciseMock.mockRejectedValue(new ApiError("Aucun exercice pour ce module", 404));

    render(<ModuleExercisePage />);

    expect(await screen.findByText("Aucun exercice pour ce module")).toBeInTheDocument();
  });
});
