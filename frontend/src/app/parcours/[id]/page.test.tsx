import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getModule, getProgress, setModuleProgress } from "@/lib/api";

import ModuleDetailPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode } & Record<string, unknown>) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "module-1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({
  getModule: vi.fn(),
  getProgress: vi.fn(),
  setModuleProgress: vi.fn(),
  logout: vi.fn(),
}));

const getModuleMock = vi.mocked(getModule);
const getProgressMock = vi.mocked(getProgress);
const setModuleProgressMock = vi.mocked(setModuleProgress);

const emptyOverview = { totalCount: 0, doneCount: 0, remainingCount: 0, percentage: 0, modules: [] };

beforeEach(() => {
  vi.clearAllMocks();
  getProgressMock.mockResolvedValue(emptyOverview);
});

describe("Page detail d'un module", () => {
  it("affiche le module et ses ressources comme une liste de liens, triee", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        {
          id: "resource-1",
          title: "Le workflow Git essentiel",
          content: "## Les concepts cles\n- Commit : un instantane.",
          resourceType: "article",
          displayOrder: 1,
        },
        {
          id: "resource-2",
          title: "Documentation officielle Git",
          content: "https://git-scm.com/doc",
          resourceType: "link",
          displayOrder: 2,
        },
      ],
    });

    render(<ModuleDetailPage />);

    expect(await screen.findByText("Git essentiel")).toBeInTheDocument();
    expect(screen.getByText("Savoir versionner son code")).toBeInTheDocument();

    const articleLink = screen.getByRole("link", { name: /Le workflow Git essentiel/ });
    expect(articleLink).toHaveAttribute("href", "/parcours/module-1/ressources/resource-1");

    const linkLink = screen.getByRole("link", { name: /Documentation officielle Git/ });
    expect(linkLink).toHaveAttribute("href", "/parcours/module-1/ressources/resource-2");
  });

  it("affiche toujours des lignes Quiz et Exercice menant vers leurs pages", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [],
    });

    render(<ModuleDetailPage />);

    const quizLink = await screen.findByRole("link", { name: /Quiz/ });
    expect(quizLink).toHaveAttribute("href", "/parcours/module-1/quiz");

    const exerciseLink = screen.getByRole("link", { name: /Exercice/ });
    expect(exerciseLink).toHaveAttribute("href", "/parcours/module-1/exercice");

    expect(screen.getByText("Aucune ressource n'est associee a ce module.")).toBeInTheDocument();
  });

  it("affiche un message d'erreur quand le module est introuvable", async () => {
    getModuleMock.mockRejectedValue(new Error("Module introuvable"));

    render(<ModuleDetailPage />);

    expect(await screen.findByText("Module introuvable")).toBeInTheDocument();
  });
});

describe("Marquer un module comme termine", () => {
  const fakeModuleDetail = {
    id: "module-1",
    title: "Git essentiel",
    shortDescription: "Les bases de Git",
    learningObjective: "Savoir versionner son code",
    displayOrder: 1,
    resources: [],
  };

  it("affiche le bouton 'Marquer comme termine' quand le module est a faire", async () => {
    getModuleMock.mockResolvedValue(fakeModuleDetail);
    getProgressMock.mockResolvedValue({
      ...emptyOverview,
      modules: [{ id: "module-1", title: fakeModuleDetail.title, displayOrder: 1, status: "todo" }],
    });

    render(<ModuleDetailPage />);

    expect(await screen.findByRole("button", { name: "Marquer comme terminé" })).toBeInTheDocument();
  });

  it("marque le module comme termine et bascule le libelle du bouton", async () => {
    getModuleMock.mockResolvedValue(fakeModuleDetail);
    setModuleProgressMock.mockResolvedValue({
      moduleId: "module-1",
      status: "done",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    render(<ModuleDetailPage />);

    const button = await screen.findByRole("button", { name: "Marquer comme terminé" });
    fireEvent.click(button);

    expect(await screen.findByRole("button", { name: "Marquer à refaire" })).toBeInTheDocument();
    expect(setModuleProgressMock).toHaveBeenCalledWith("module-1", "done");
  });

  it("affiche un message d'erreur quand l'enregistrement de la progression echoue", async () => {
    getModuleMock.mockResolvedValue(fakeModuleDetail);
    setModuleProgressMock.mockRejectedValue(new Error("Impossible d'enregistrer la progression."));

    render(<ModuleDetailPage />);

    const button = await screen.findByRole("button", { name: "Marquer comme terminé" });
    fireEvent.click(button);

    expect(await screen.findByText("Impossible d'enregistrer la progression.")).toBeInTheDocument();
  });
});
