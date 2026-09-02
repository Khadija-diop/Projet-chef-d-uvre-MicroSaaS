"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { register } from "@/lib/api";

import { AuthTabs } from "../auth-tabs";
import styles from "../auth.module.css";

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
      setError("Impossible de créer le compte (email déjà utilisé ou mot de passe trop court)");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <AuthTabs active="inscription" />

        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.subtitle}>Rejoins le parcours et démarre ta progression.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className={styles.label} htmlFor="password">
            Mot de passe
          </label>
          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-describedby="password-hint"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p id="password-hint" className={styles.hint}>
            8 caractères minimum.
          </p>

          {error && (
            <p className={styles.error} role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className={styles.switch}>
          Déjà un compte ? <Link href="/connexion">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
