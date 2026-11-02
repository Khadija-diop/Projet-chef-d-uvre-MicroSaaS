import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, getModule } from "@/lib/api";

import ResourceDetailPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "module-1", resourceId: "resource-1" }),
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

describe("Page detail d'une ressource", () => {
  it("affiche le contenu redige d'une ressource article", async () => {
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
          resourceType: "article",
          displayOrder: 1,
          content: "## Les concepts cles\n- Commit : un instantane.",
        },
      ],
    });

    render(<ResourceDetailPage />);

    expect(await screen.findByRole("heading", { name: "Le workflow Git essentiel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Les concepts cles" })).toBeInTheDocument();
    expect(screen.getByText("Commit : un instantane.")).toBeInTheDocument();
  });

  it("affiche un lien externe pour une ressource video", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        {
          id: "resource-1",
          title: "Video : Git et GitHub de A a Z",
          resourceType: "video",
          displayOrder: 1,
          content: "https://www.youtube.com/watch?v=RGOj5yH7evk",
        },
      ],
    });

    render(<ResourceDetailPage />);

    const link = await screen.findByRole("link", { name: "Ouvrir la ressource" });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=RGOj5yH7evk");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("n'affiche pas de lien quand l'URL de la ressource n'est pas en http(s)", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [
        {
          id: "resource-1",
          title: "Lien piege",
          resourceType: "link",
          displayOrder: 1,
          content: "javascript:alert(1)",
        },
      ],
    });

    render(<ResourceDetailPage />);

    expect(await screen.findByText("Lien de ressource invalide.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ouvrir la ressource" })).not.toBeInTheDocument();
  });

  it("affiche un message quand la ressource est introuvable", async () => {
    getModuleMock.mockResolvedValue({
      id: "module-1",
      title: "Git essentiel",
      shortDescription: "Les bases de Git",
      learningObjective: "Savoir versionner son code",
      displayOrder: 1,
      resources: [],
    });

    render(<ResourceDetailPage />);

    expect(await screen.findByText("Ressource introuvable.")).toBeInTheDocument();
  });
});
