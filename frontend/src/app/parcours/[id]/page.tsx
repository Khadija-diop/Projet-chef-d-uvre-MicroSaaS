"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getModule, getProgress, setModuleProgress, type ModuleDetail, type ProgressStatus } from "@/lib/api";

import { AppShell } from "../app-shell";
import { BackLink } from "../back-link";
import { CheckIcon } from "../icons";
import { ResourceIcon } from "../resource-icon";
import { RESOURCE_TYPE_LABELS } from "../resource-meta";
import styles from "../parcours.module.css";
import { StatusBadge } from "../status-badge";

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [moduleDetail, setModuleDetail] = useState<ModuleDetail | undefined>(undefined);
  const [status, setStatus] = useState<ProgressStatus>("todo");
  const [error, setError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    async function loadModule() {
      try {
        setModuleDetail(await getModule(id));
      } catch (caughtError) {
        setError(
          caughtError instanceof Error && caughtError.message
            ? caughtError.message
            : "Impossible de charger ce module pour le moment.",
        );
        return;
      }

      try {
        const overview = await getProgress();
        setStatus(overview.modules.find((module) => module.id === id)?.status ?? "todo");
      } catch {
        // La progression n'a pas pu être chargée : le module reste affiché, statut par défaut "todo".
      }
    }
    loadModule();
  }, [id]);

  async function handleToggleDone() {
    setSavingProgress(true);
    setProgressError(null);
    try {
      const progress = await setModuleProgress(id, status === "done" ? "todo" : "done");
      setStatus(progress.status);
    } catch (caughtError) {
      setProgressError(
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "Impossible d'enregistrer la progression.",
      );
    } finally {
      setSavingProgress(false);
    }
  }

  return (
    <AppShell active="modules">
      <BackLink href="/parcours" label="Retour au parcours" />

      {error && <p className={styles.error}>{error}</p>}

      {!error && moduleDetail === undefined && <p className={styles.empty}>Chargement...</p>}

      {moduleDetail && (
        <>
          <div className={styles.detailHead}>
            <div>
              <h1 className={styles.title}>{moduleDetail.title}</h1>
              <p className={styles.description}>{moduleDetail.shortDescription}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className={styles.objective}>
            <span className={styles.objectiveLabel}>Objectif pédagogique</span>
            <p>{moduleDetail.learningObjective}</p>
          </div>

          <section className={styles.resources}>
            <h2>Ressources associees</h2>
            {moduleDetail.resources.length === 0 && (
              <p className={styles.empty}>Aucune ressource n&apos;est associee a ce module.</p>
            )}
            <ul className={styles.resourceList}>
              {moduleDetail.resources.map((resource) => (
                <li key={resource.id}>
                  <Link
                    href={`/parcours/${moduleDetail.id}/ressources/${resource.id}`}
                    className={styles.resourceRow}
                  >
                    <ResourceIcon type={resource.resourceType} />
                    <span className={styles.resourceRowBody}>{resource.title}</span>
                    <span className={styles.resourceType}>
                      {RESOURCE_TYPE_LABELS[resource.resourceType]}
                    </span>
                    <svg className={styles.moduleRowChevron} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/parcours/${moduleDetail.id}/quiz`} className={styles.resourceRow}>
                  <ResourceIcon type="quiz" />
                  <span className={styles.resourceRowBody}>Quiz</span>
                  <span className={styles.resourceType}>Evaluation</span>
                  <svg className={styles.moduleRowChevron} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link href={`/parcours/${moduleDetail.id}/exercice`} className={styles.resourceRow}>
                  <ResourceIcon type="exercise" />
                  <span className={styles.resourceRowBody}>Exercice</span>
                  <span className={styles.resourceType}>Pratique</span>
                  <svg className={styles.moduleRowChevron} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
            </ul>
          </section>

          <div className={styles.detailActions}>
            {progressError && <p className={styles.error}>{progressError}</p>}
            {status === "done" ? (
              <>
                <span className={styles.detailDoneNote}>
                  <CheckIcon className={styles.icon} />
                  Module terminé
                </span>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleToggleDone}
                  disabled={savingProgress}
                >
                  Marquer à refaire
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleToggleDone}
                disabled={savingProgress}
              >
                <CheckIcon className={styles.btnIcon} />
                Marquer comme terminé
              </button>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
