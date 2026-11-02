import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, getModule } from "@/lib/api";

import ModuleDetailPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
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

  it("affiche toujours une ligne Quiz menant vers la page du quiz", async () => {
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
    expect(screen.getByText("Aucune ressource n'est associee a ce module.")).toBeInTheDocument();
  });

  it("affiche un message d'erreur quand le module est introuvable", async () => {
    getModuleMock.mockRejectedValue(new Error("Module introuvable"));

    render(<ModuleDetailPage />);

    expect(await screen.findByText("Module introuvable")).toBeInTheDocument();
  });
});
