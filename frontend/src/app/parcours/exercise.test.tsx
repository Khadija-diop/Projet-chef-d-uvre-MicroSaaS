import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, getExercise, submitExercise } from "@/lib/api";

import { ExerciseSection } from "./exercise";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ApiError: actual.ApiError,
    getExercise: vi.fn(),
    submitExercise: vi.fn(),
  };
});

const getExerciseMock = vi.mocked(getExercise);
const submitExerciseMock = vi.mocked(submitExercise);

const exercise = {
  id: "exercise-1",
  prompt: "Cree une branche et commite un changement.",
  submittedAnswer: null,
  modelAnswer: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ExerciseSection", () => {
  it("affiche le message de l'API quand le module n'a pas d'exercice", async () => {
    getExerciseMock.mockRejectedValue(new ApiError("Aucun exercice pour ce module", 404));

    render(<ExerciseSection moduleId="module-1" />);

    expect(await screen.findByText("Aucun exercice pour ce module")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Exercice" })).not.toBeInTheDocument();
  });

  it("affiche l'enonce et masque le bouton de soumission tant que la reponse est vide", async () => {
    getExerciseMock.mockResolvedValue(exercise);

    render(<ExerciseSection moduleId="module-1" />);

    expect(await screen.findByText("Cree une branche et commite un changement.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Soumettre/ })).toBeDisabled();
    expect(screen.queryByText("Reponse modele")).not.toBeInTheDocument();
  });

  it("revele la reponse modele apres soumission", async () => {
    getExerciseMock.mockResolvedValue(exercise);
    submitExerciseMock.mockResolvedValue({
      submittedAnswer: "git checkout -b exercice-git",
      modelAnswer: "git checkout -b exercice-git puis git commit",
    });
    const user = userEvent.setup();

    render(<ExerciseSection moduleId="module-1" />);

    await user.type(await screen.findByLabelText("Ta reponse"), "git checkout -b exercice-git");
    await user.click(screen.getByRole("button", { name: /Soumettre/ }));

    expect(await screen.findByText("Reponse modele")).toBeInTheDocument();
    expect(screen.getByText("git checkout -b exercice-git puis git commit")).toBeInTheDocument();
    expect(submitExerciseMock).toHaveBeenCalledWith("module-1", "git checkout -b exercice-git");
  });

  it("revele directement la reponse modele quand l'exercice a deja ete soumis avant", async () => {
    getExerciseMock.mockResolvedValue({
      ...exercise,
      submittedAnswer: "une ancienne reponse",
      modelAnswer: "la reponse modele",
    });

    render(<ExerciseSection moduleId="module-1" />);

    expect(await screen.findByText("une ancienne reponse")).toBeInTheDocument();
    expect(screen.getByText("la reponse modele")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Modifier ma reponse" })).toBeInTheDocument();
  });

  it("permet de revenir au formulaire pour modifier sa reponse", async () => {
    getExerciseMock.mockResolvedValue({
      ...exercise,
      submittedAnswer: "une ancienne reponse",
      modelAnswer: "la reponse modele",
    });
    const user = userEvent.setup();

    render(<ExerciseSection moduleId="module-1" />);

    await user.click(await screen.findByRole("button", { name: "Modifier ma reponse" }));

    expect(screen.getByLabelText("Ta reponse")).toHaveValue("une ancienne reponse");
    expect(screen.queryByText("Reponse modele")).not.toBeInTheDocument();
  });

  it("invite a se connecter quand la soumission renvoie 401", async () => {
    getExerciseMock.mockResolvedValue(exercise);
    submitExerciseMock.mockRejectedValue(new ApiError("Authentification requise", 401));
    const user = userEvent.setup();

    render(<ExerciseSection moduleId="module-1" />);

    await user.type(await screen.findByLabelText("Ta reponse"), "une reponse");
    await user.click(screen.getByRole("button", { name: /Soumettre/ }));

    expect(
      await screen.findByText("Connecte-toi pour soumettre ta reponse et voir la reponse modele."),
    ).toBeInTheDocument();
  });
});
