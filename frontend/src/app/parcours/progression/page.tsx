"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getProgress, type ProgressOverview } from "@/lib/api";

import { FocusHeading } from "../../focus-heading";
import { AppShell } from "../app-shell";
import { ChevronIcon } from "../icons";
import styles from "../parcours.module.css";
import { StatusBadge } from "../status-badge";

export default function ProgressionPage() {
  const [overview, setOverview] = useState<ProgressOverview | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        setOverview(await getProgress());
      } catch (caughtError) {
        setError(
          caughtError instanceof Error && caughtError.message
            ? caughtError.message
            : "Impossible de charger la progression pour le moment.",
        );
      }
    }
    loadProgress();
  }, []);

  const inProgressCount = overview?.modules.filter((module) => module.status === "in_progress").length ?? 0;
  const todoCount = overview ? overview.totalCount - overview.doneCount - inProgressCount : 0;

  return (
    <AppShell active="progress">
      <h1 className={styles.pageTitle}>Votre progression</h1>
      <FocusHeading />
      <p className={styles.pageLede}>Vue d&apos;ensemble de votre avancement sur le parcours.</p>

      {error && <p className={styles.error}>{error}</p>}

      {!error && overview === undefined && <p className={styles.empty}>Chargement...</p>}

      {overview && (
        <>
          <div className={styles.progressSummary}>
            <div className={styles.progressSummaryTop}>
              <strong>Modules terminés</strong>
              <span className={styles.progressPercentage}>{overview.percentage}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressBarFill} style={{ width: `${overview.percentage}%` }} />
            </div>
            <div className={styles.progressStats}>
              <span>
                Terminés : <strong>{overview.doneCount}</strong>
              </span>
              <span>
                En cours : <strong>{inProgressCount}</strong>
              </span>
              <span>
                À faire : <strong>{todoCount}</strong>
              </span>
            </div>
          </div>

          {overview.modules.length === 0 ? (
            <p className={styles.empty}>Aucun module n&apos;est publié pour le moment.</p>
          ) : (
            <ol className={styles.moduleList}>
              {overview.modules.map((module) => (
                <li key={module.id}>
                  <Link href={`/parcours/${module.id}`} className={styles.moduleRow} aria-label={module.title}>
                    <span className={styles.moduleRowOrder}>{String(module.displayOrder).padStart(2, "0")}</span>
                    <span className={styles.moduleRowBody}>
                      <h2>{module.title}</h2>
                    </span>
                    <StatusBadge status={module.status} />
                    <ChevronIcon className={styles.moduleRowChevron} />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </AppShell>
  );
}
