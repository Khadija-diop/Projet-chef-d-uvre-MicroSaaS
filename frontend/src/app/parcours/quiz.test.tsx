import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, getQuiz, submitQuizAttempt } from "@/lib/api";

import { QuizSection } from "./quiz";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ApiError: actual.ApiError,
    getQuiz: vi.fn(),
    submitQuizAttempt: vi.fn(),
  };
});

const getQuizMock = vi.mocked(getQuiz);
const submitQuizAttemptMock = vi.mocked(submitQuizAttempt);

const quiz = {
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
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("QuizSection", () => {
  it("n'affiche rien quand le module n'a pas de quiz", async () => {
    getQuizMock.mockRejectedValue(new ApiError("Aucun quiz pour ce module", 404));

    const { container } = render(<QuizSection moduleId="module-1" />);

    await vi.waitFor(() => expect(getQuizMock).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("affiche les questions et desactive la validation tant que tout n'est pas repondu", async () => {
    getQuizMock.mockResolvedValue(quiz);
    const user = userEvent.setup();

    render(<QuizSection moduleId="module-1" />);

    expect(await screen.findByText("Quelle commande affiche le contenu d'un dossier ?", { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Valider mes reponses" })).toBeDisabled();

    await user.click(screen.getByLabelText("ls"));

    expect(screen.getByRole("button", { name: "Valider mes reponses" })).toBeEnabled();
  });

  it("affiche le score et la bonne reponse apres validation", async () => {
    getQuizMock.mockResolvedValue(quiz);
    submitQuizAttemptMock.mockResolvedValue({
      score: 1,
      totalCount: 1,
      results: [{ questionId: "question-1", correctChoiceId: "choice-1", isCorrect: true }],
    });
    const user = userEvent.setup();

    render(<QuizSection moduleId="module-1" />);

    await user.click(await screen.findByLabelText("ls"));
    await user.click(screen.getByRole("button", { name: "Valider mes reponses" }));

    expect(await screen.findByText("Score : 1 / 1")).toBeInTheDocument();
    expect(screen.getByText("Bonne reponse")).toBeInTheDocument();
    expect(submitQuizAttemptMock).toHaveBeenCalledWith("module-1", [{ questionId: "question-1", choiceId: "choice-1" }]);
  });

  it("invite a se connecter quand la soumission renvoie 401", async () => {
    getQuizMock.mockResolvedValue(quiz);
    submitQuizAttemptMock.mockRejectedValue(new ApiError("Authentification requise", 401));
    const user = userEvent.setup();

    render(<QuizSection moduleId="module-1" />);

    await user.click(await screen.findByLabelText("ls"));
    await user.click(screen.getByRole("button", { name: "Valider mes reponses" }));

    expect(
      await screen.findByText("Connecte-toi pour valider ce quiz et enregistrer ton score."),
    ).toBeInTheDocument();
  });
});
