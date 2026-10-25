"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listModules, type ModuleSummary } from "@/lib/api";

import { UserMenu } from "../user-menu";
import homeStyles from "../page.module.css";
import styles from "./parcours.module.css";

export default function ParcoursPage() {
  const [modules, setModules] = useState<ModuleSummary[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModules() {
      try {
        setModules(await listModules());
      } catch {
        setError("Impossible de charger le parcours pour le moment.");
      }
    }
    loadModules();
  }, []);

  return (
    <div className={homeStyles.page}>
      <header className={homeStyles.topbar}>
        <Link href="/" className={homeStyles.brand}>
          <svg className={homeStyles.brandIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M15 9l-2 6-4-2 2-6z" />
          </svg>
          Parcours DevOps Guide
        </Link>
        <nav className={homeStyles.nav} aria-label="Compte">
          <UserMenu />
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Le parcours</h1>
        <p className={styles.subtitle}>Les modules publies, dans l&apos;ordre a suivre.</p>

        {error && <p className={styles.error}>{error}</p>}

        {!error && modules === undefined && <p className={styles.empty}>Chargement...</p>}

        {!error && modules?.length === 0 && (
          <p className={styles.empty}>Aucun module n&apos;est publie pour le moment.</p>
        )}

        {modules && modules.length > 0 && (
          <ol className={styles.list}>
            {modules.map((module) => (
              <li key={module.id} className={styles.item}>
                <div className={styles.itemBody}>
                  <span className={styles.order}>Module {module.displayOrder}</span>
                  <h2>{module.title}</h2>
                  <p>{module.shortDescription}</p>
                </div>
                <Link href={`/parcours/${module.id}`} className={homeStyles.btnSecondary}>
                  Voir le detail
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>

      <footer className={homeStyles.footer}>Projet Chef-d&apos;oeuvre: DevOps Guide</footer>
    </div>
  );
}
