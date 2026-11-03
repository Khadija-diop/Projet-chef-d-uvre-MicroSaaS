"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { getModule } from "@/lib/api";
import { useAsyncData } from "@/lib/use-async-data";

import { BackLink } from "../back-link";
import { RESOURCE_TYPE_LABELS } from "../resource-meta";
import { ResourceIcon } from "../resource-icon";
import { SiteFooter, SiteHeader } from "../../site-shell";
import homeStyles from "../../page.module.css";
import styles from "../parcours.module.css";

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: moduleDetail, error } = useAsyncData(
    () => getModule(id),
    [id],
    "Impossible de charger ce module pour le moment.",
  );

  return (
    <div className={homeStyles.page}>
      <SiteHeader />

      <main className={styles.main}>
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
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
