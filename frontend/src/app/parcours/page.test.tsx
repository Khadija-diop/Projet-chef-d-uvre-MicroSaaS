import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, listModules } from "@/lib/api";

import ParcoursPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/lib/api", () => ({
  listModules: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

const listModulesMock = vi.mocked(listModules);
const getCurrentUserMock = vi.mocked(getCurrentUser);

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUserMock.mockResolvedValue(null);
});

describe("Page liste des modules", () => {
  it("affiche les modules tries par ordre d'affichage", async () => {
    listModulesMock.mockResolvedValue([
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
        shortDescription: "Automatiser les livraisons",
        learningObjective: "Comprendre un pipeline",
        displayOrder: 2,
      },
    ]);

    render(<ParcoursPage />);

    expect(await screen.findByText("Git essentiel")).toBeInTheDocument();
    expect(screen.getByText("CI/CD")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Git essentiel" })).toHaveAttribute("href", "/parcours/module-1");
    expect(screen.getByRole("link", { name: "CI/CD" })).toHaveAttribute("href", "/parcours/module-2");
  });

  it("affiche un message quand aucun module n'est publie", async () => {
    listModulesMock.mockResolvedValue([]);

    render(<ParcoursPage />);

    expect(await screen.findByText("Aucun module n'est publie pour le moment.")).toBeInTheDocument();
  });

  it("affiche le message d'erreur renvoye par l'API", async () => {
    listModulesMock.mockRejectedValue(new Error("Impossible de joindre le serveur"));

    render(<ParcoursPage />);

    expect(await screen.findByText("Impossible de joindre le serveur")).toBeInTheDocument();
  });

  it("affiche un message generique quand l'erreur n'a pas de message", async () => {
    listModulesMock.mockRejectedValue(new Error());

    render(<ParcoursPage />);

    expect(await screen.findByText("Impossible de charger le parcours pour le moment.")).toBeInTheDocument();
  });
});
