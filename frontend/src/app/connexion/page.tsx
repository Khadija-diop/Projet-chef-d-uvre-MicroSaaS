"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { login } from "@/lib/api";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch {
      setError("Identifiants invalides");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Se connecter</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p>
        Pas encore de compte ? <Link href="/inscription">Creer un compte</Link>
      </p>
    </main>
  );
}
