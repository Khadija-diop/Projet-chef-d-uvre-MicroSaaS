import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { login } from "@/lib/api";

import ConnexionPage from "./page";

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
  login: vi.fn(),
}));

const loginMock = vi.mocked(login);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Page de connexion", () => {
  it("soumet les identifiants puis redirige vers l'accueil", async () => {
    loginMock.mockResolvedValue({ id: "u1", email: "learner@example.com", role: "learner" });
    const user = userEvent.setup();

    render(<ConnexionPage />);
    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "password123");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(loginMock).toHaveBeenCalledWith("learner@example.com", "password123");
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });

  it("affiche une erreur et ne redirige pas quand la connexion échoue", async () => {
    loginMock.mockRejectedValue(new Error("401"));
    const user = userEvent.setup();

    render(<ConnexionPage />);
    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "password123");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Identifiants invalides");
    expect(push).not.toHaveBeenCalled();
  });

  it("ne demande pas de champ Nom", () => {
    render(<ConnexionPage />);

    expect(screen.queryByLabelText(/nom/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
  });
});
