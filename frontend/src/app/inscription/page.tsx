"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { register } from "@/lib/api";

export default function InscriptionPage() {
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
      await register(email, password);
      router.push("/");
      router.refresh();
    } catch {
      setError("Impossible de creer le compte (email deja utilise ou mot de passe trop court)");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Creer un compte</h1>
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
          autoComplete="new-password"
          minLength={8}
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
          {isSubmitting ? "Creation..." : "Creer mon compte"}
        </button>
      </form>

      <p>
        Deja un compte ? <Link href="/connexion">Se connecter</Link>
      </p>
    </main>
  );
}
