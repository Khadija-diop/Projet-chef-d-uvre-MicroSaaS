import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { register } from "@/lib/api";

import InscriptionPage from "./page";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) =>
    createElement("a", { href }, children),
}));

vi.mock("@/lib/api", () => ({
  register: vi.fn(),
}));

const registerMock = vi.mocked(register);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Page d'inscription", () => {
  it("soumet email + mot de passe puis redirige vers l'accueil", async () => {
    registerMock.mockResolvedValue({ id: "u1", email: "new@example.com", role: "learner" });
    const user = userEvent.setup();

    render(<InscriptionPage />);
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "password123");
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(registerMock).toHaveBeenCalledWith("new@example.com", "password123");
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });

  it("affiche une erreur et ne redirige pas quand la création échoue", async () => {
    registerMock.mockRejectedValue(new Error("409"));
    const user = userEvent.setup();

    render(<InscriptionPage />);
    await user.type(screen.getByLabelText("Email"), "taken@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "password123");
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de créer le compte (email déjà utilisé ou mot de passe trop court)",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("ne demande pas de champ Nom (email + mot de passe uniquement)", () => {
    render(<InscriptionPage />);

    expect(screen.queryByLabelText(/nom/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(1); // seul l'email est un textbox
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
  });
});
