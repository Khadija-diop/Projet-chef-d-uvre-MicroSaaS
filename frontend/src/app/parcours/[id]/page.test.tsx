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
      await screen.findByText("Aucune ressource n'est associée à ce module."),
    ).toBeInTheDocument();
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
