"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getModule, getProgress, setModuleProgress, type ModuleDetail, type ProgressStatus } from "@/lib/api";
import { announce } from "@/lib/announce";

import { FocusHeading } from "../../focus-heading";
import { AppShell } from "../app-shell";
import { ArticleIcon, BackIcon, CheckIcon, ChecklistIcon, LinkTypeIcon, VideoIcon } from "../icons";
import styles from "../parcours.module.css";
import { StatusBadge } from "../status-badge";

const RESOURCE_TYPE_META: Record<
  ModuleDetail["resources"][number]["resourceType"],
  { icon: typeof ArticleIcon; label: string }
> = {
  article: { icon: ArticleIcon, label: "Article" },
  video: { icon: VideoIcon, label: "Vidéo" },
  link: { icon: LinkTypeIcon, label: "Lien" },
  checklist: { icon: ChecklistIcon, label: "Checklist" },
};

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
        // La progression n'a pas pu etre chargee : le module reste affiche, statut par defaut "todo".
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
      announce(
        progress.status === "done" ? "Module marqué comme terminé. Progression mise à jour." : "Module remis à faire. Progression mise à jour.",
      );
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
      <Link href="/parcours" className={styles.detailBack}>
        <BackIcon className={styles.icon} />
        Retour à la liste
      </Link>

      {error && <p className={styles.error}>{error}</p>}

      {!error && moduleDetail === undefined && <p className={styles.empty}>Chargement...</p>}

      {moduleDetail && (
        <>
          <div className={styles.detailHead}>
            <div>
              <h1 className={styles.pageTitle}>{moduleDetail.title}</h1>
              <FocusHeading />
              <p className={styles.description}>{moduleDetail.shortDescription}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className={styles.objective}>
            <span className={styles.objectiveLabel}>Objectif pédagogique</span>
            <p className={styles.objectiveText}>{moduleDetail.learningObjective}</p>
          </div>

          <section className={styles.resources}>
            <h2>Ressources associées</h2>
            {moduleDetail.resources.length === 0 ? (
              <p className={styles.empty}>Aucune ressource n&apos;est associée à ce module.</p>
            ) : (
              <ul className={styles.resourceList}>
                {moduleDetail.resources.map((resource) => {
                  const { icon: ResourceIcon, label } = RESOURCE_TYPE_META[resource.resourceType];
                  return (
                    <li key={resource.id} className={styles.resource}>
                      <ResourceIcon className={styles.resourceIcon} />
                      {resource.resourceType === "checklist" ? (
                        <span>{resource.content}</span>
                      ) : (
                        <a href={resource.content} target="_blank" rel="noreferrer noopener">
                          {resource.content}
                        </a>
                      )}
                      <span className={styles.resourceType}>{label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
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
