import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, getModule } from "@/lib/api";

import ModuleDetailPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) =>
    createElement("a", { href }, children),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "module-1" }),
}));

vi.mock("@/lib/api", () => ({
  getModule: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

const getModuleMock = vi.mocked(getModule);
const getCurrentUserMock = vi.mocked(getCurrentUser);

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUserMock.mockResolvedValue(null);
});

describe("Page detail d'un module", () => {
  it("affiche le module et ses ressources triees", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        { id: "resource-1", content: "https://git-scm.com/doc", resourceType: "link", displayOrder: 1 },
        { id: "resource-2", content: "Checklist Git", resourceType: "checklist", displayOrder: 2 },
      ],
    });

    render(<ModuleDetailPage />);

    expect(await screen.findByText("Git essentiel")).toBeInTheDocument();
    expect(screen.getByText("Savoir versionner son code")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://git-scm.com/doc" })).toHaveAttribute(
      "href",
      "https://git-scm.com/doc",
    );
    expect(screen.getByText("Checklist Git")).toBeInTheDocument();
  });

  it("affiche le contenu d'une ressource de type article comme du texte, pas comme un lien", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        { id: "resource-1", content: "Un article redige sur Git.", resourceType: "article", displayOrder: 1 },
      ],
    });

    render(<ModuleDetailPage />);

    expect(await screen.findByText("Un article redige sur Git.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Un article redige sur Git." })).not.toBeInTheDocument();
  });

  it("met en forme le markdown d'une lecon (titres, liste, code inline)", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        {
          id: "resource-1",
          resourceType: "article",
          displayOrder: 1,
          content: "## Les concepts cles\n- Commit : un instantane.\n\n## Exemple pratique\nLance `git status` pour voir l'etat du depot.",
        },
      ],
    });

    render(<ModuleDetailPage />);

    expect(await screen.findByRole("heading", { name: "Les concepts cles" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Exemple pratique" })).toBeInTheDocument();
    expect(screen.getByText("Commit : un instantane.")).toBeInTheDocument();
    expect(screen.getByText("git status")).toHaveProperty("tagName", "CODE");
  });

  it("affiche un message quand le module n'a pas de ressource", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [],
    });

    render(<ModuleDetailPage />);

    expect(
      await screen.findByText("Aucune ressource n'est associee a ce module."),
    ).toBeInTheDocument();
  });

  it("affiche un message d'erreur quand le module est introuvable", async () => {
    getModuleMock.mockRejectedValue(new Error("Module introuvable"));

    render(<ModuleDetailPage />);

    expect(await screen.findByText("Module introuvable")).toBeInTheDocument();
  });
});
