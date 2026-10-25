import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, listModules } from "@/lib/api";

import ParcoursPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) =>
    createElement("a", { href }, children),
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
    const links = screen.getAllByRole("link", { name: "Voir le detail" });
    expect(links[0]).toHaveAttribute("href", "/parcours/module-1");
    expect(links[1]).toHaveAttribute("href", "/parcours/module-2");
  });

  it("affiche un message quand aucun module n'est publie", async () => {
    listModulesMock.mockResolvedValue([]);

    render(<ParcoursPage />);

    expect(await screen.findByText("Aucun module n'est publie pour le moment.")).toBeInTheDocument();
  });

  it("affiche un message d'erreur quand l'appel API echoue", async () => {
    listModulesMock.mockRejectedValue(new Error("Impossible de joindre le serveur"));

    render(<ParcoursPage />);

    expect(await screen.findByText("Impossible de charger le parcours pour le moment.")).toBeInTheDocument();
  });
});
