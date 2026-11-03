import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProgress, listModules } from "@/lib/api";

import ParcoursPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode } & Record<string, unknown>) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({
  listModules: vi.fn(),
  getProgress: vi.fn(),
  logout: vi.fn(),
}));

const listModulesMock = vi.mocked(listModules);
const getProgressMock = vi.mocked(getProgress);

const emptyOverview = { totalCount: 0, doneCount: 0, remainingCount: 0, percentage: 0, modules: [] };

beforeEach(() => {
  vi.clearAllMocks();
  getProgressMock.mockResolvedValue(emptyOverview);
});

describe("Page liste des modules", () => {
  it("affiche les modules tries par ordre d'affichage avec leur statut", async () => {
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
    getProgressMock.mockResolvedValue({
      totalCount: 2,
      doneCount: 1,
      remainingCount: 1,
      percentage: 50,
      modules: [{ id: "module-1", title: "Git essentiel", displayOrder: 1, status: "done" }],
    });

    render(<ParcoursPage />);

    expect(await screen.findByText("Git essentiel")).toBeInTheDocument();
    expect(screen.getByText("CI/CD")).toBeInTheDocument();
    expect(screen.getByText("Terminé")).toBeInTheDocument();
    expect(screen.getByText("À faire")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: /Git essentiel|CI\/CD/ });
    expect(links[0]).toHaveAttribute("href", "/parcours/module-1");
    expect(links[1]).toHaveAttribute("href", "/parcours/module-2");

    expect(screen.getByRole("link", { name: "Liste des modules" })).toHaveAttribute("href", "/parcours");
    expect(screen.getByRole("link", { name: "Ma progression" })).toHaveAttribute(
      "href",
      "/parcours/progression",
    );
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
