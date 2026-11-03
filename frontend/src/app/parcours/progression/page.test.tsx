import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProgress } from "@/lib/api";

import ProgressionPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode } & Record<string, unknown>) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({
  getProgress: vi.fn(),
  logout: vi.fn(),
}));

const getProgressMock = vi.mocked(getProgress);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Page tableau de progression", () => {
  it("affiche le resume et la liste des modules avec leur statut", async () => {
    getProgressMock.mockResolvedValue({
      totalCount: 3,
      doneCount: 1,
      remainingCount: 2,
      percentage: 33,
      modules: [
        { id: "module-1", title: "Linux", displayOrder: 1, status: "done" },
        { id: "module-2", title: "Git", displayOrder: 2, status: "in_progress" },
        { id: "module-3", title: "Docker", displayOrder: 3, status: "todo" },
      ],
    });

    render(<ProgressionPage />);

    expect(await screen.findByText("33%")).toBeInTheDocument();
    expect(screen.getByText(/Terminés :/)).toBeInTheDocument();
    expect(screen.getByText(/En cours :/)).toBeInTheDocument();
    expect(screen.getByText(/À faire :/)).toBeInTheDocument();
    expect(screen.getByText("Linux")).toBeInTheDocument();
    expect(screen.getByText("Terminé")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("À faire")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Linux" })).toHaveAttribute("href", "/parcours/module-1");
  });

  it("affiche un message quand aucun module n'est publie", async () => {
    getProgressMock.mockResolvedValue({
      totalCount: 0,
      doneCount: 0,
      remainingCount: 0,
      percentage: 0,
      modules: [],
    });

    render(<ProgressionPage />);

    expect(await screen.findByText("Aucun module n'est publié pour le moment.")).toBeInTheDocument();
  });

  it("affiche un message d'erreur quand l'appel API echoue", async () => {
    getProgressMock.mockRejectedValue(new Error("Impossible de joindre le serveur"));

    render(<ProgressionPage />);

    expect(await screen.findByText("Impossible de joindre le serveur")).toBeInTheDocument();
  });
});
