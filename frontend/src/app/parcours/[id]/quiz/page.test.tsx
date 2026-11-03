import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, getQuiz } from "@/lib/api";

import ModuleQuizPage from "./page";

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
    getQuiz: vi.fn(),
    submitQuizAttempt: vi.fn(),
    logout: vi.fn(),
  };
});

const getQuizMock = vi.mocked(getQuiz);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Page quiz d'un module", () => {
  it("affiche un lien de retour vers le module et le quiz charge", async () => {
    getQuizMock.mockResolvedValue({
      id: "quiz-1",
      questions: [
        {
          id: "question-1",
          prompt: "Quelle commande affiche le contenu d'un dossier ?",
          displayOrder: 1,
          choices: [
            { id: "choice-1", label: "ls" },
            { id: "choice-2", label: "rm" },
          ],
        },
      ],
    });

    render(<ModuleQuizPage />);

    expect(screen.getByRole("link", { name: /Retour au module/ })).toHaveAttribute("href", "/parcours/module-1");
    expect(
      await screen.findByText("Quelle commande affiche le contenu d'un dossier ?", { exact: false }),
    ).toBeInTheDocument();
  });

  it("indique que le module n'a pas de quiz", async () => {
    getQuizMock.mockRejectedValue(new ApiError("Aucun quiz pour ce module", 404));

    render(<ModuleQuizPage />);

    expect(await screen.findByText("Aucun quiz pour ce module")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Quiz" })).not.toBeInTheDocument();
  });
});
