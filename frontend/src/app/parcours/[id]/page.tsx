"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getModule, type ModuleDetail } from "@/lib/api";

import { UserMenu } from "../../user-menu";
import homeStyles from "../../page.module.css";
import styles from "../parcours.module.css";

const RESOURCE_TYPE_LABELS: Record<ModuleDetail["resources"][number]["resourceType"], string> = {
  article: "Article",
  video: "Video",
  link: "Lien",
  checklist: "Checklist",
};

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [moduleDetail, setModuleDetail] = useState<ModuleDetail | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

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
      }
    }
    loadModule();
  }, [id]);

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
        <Link href="/parcours" className={styles.back}>
          &larr; Retour au parcours
        </Link>

        {error && <p className={styles.error}>{error}</p>}

        {!error && moduleDetail === undefined && <p className={styles.empty}>Chargement...</p>}

        {moduleDetail && (
          <>
            <h1 className={styles.title}>{moduleDetail.title}</h1>
            <p className={styles.objective}>{moduleDetail.learningObjective}</p>
            <p className={styles.description}>{moduleDetail.shortDescription}</p>

            <section className={styles.resources}>
              <h2>Ressources associees</h2>
              {moduleDetail.resources.length === 0 ? (
                <p className={styles.empty}>Aucune ressource n&apos;est associee a ce module.</p>
              ) : (
                <ul className={styles.resourceList}>
                  {moduleDetail.resources.map((resource) => (
                    <li key={resource.id} className={styles.resource}>
                      <span className={styles.resourceType}>
                        {RESOURCE_TYPE_LABELS[resource.resourceType]}
                      </span>
                      {resource.resourceType === "checklist" ? (
                        <span>{resource.content}</span>
                      ) : (
                        <a href={resource.content} target="_blank" rel="noreferrer noopener">
                          {resource.content}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      <footer className={homeStyles.footer}>Projet Chef-d&apos;oeuvre: DevOps Guide</footer>
    </div>
  );
}
