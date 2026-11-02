"use client";

import { useParams } from "next/navigation";

import { getModule } from "@/lib/api";
import { useAsyncData } from "@/lib/use-async-data";

import { BackLink } from "../../../back-link";
import { LessonContent } from "../../../lesson-content";
import { EXTERNAL_LINK_TYPES, RESOURCE_TYPE_LABELS } from "../../../resource-meta";
import { ResourceIcon } from "../../../resource-icon";
import { SiteFooter, SiteHeader } from "../../../../site-shell";
import homeStyles from "../../../../page.module.css";
import styles from "../../../parcours.module.css";

export default function ResourceDetailPage() {
  const { id, resourceId } = useParams<{ id: string; resourceId: string }>();
  const { data: moduleDetail, error } = useAsyncData(
    () => getModule(id),
    [id],
    "Impossible de charger cette ressource pour le moment.",
  );

  const resource = moduleDetail?.resources.find((item) => item.id === resourceId);

  return (
    <div className={homeStyles.page}>
      <SiteHeader />

      <main className={styles.main}>
        <BackLink href={`/parcours/${id}`} label="Retour au module" />

        {error && <p className={styles.error}>{error}</p>}

        {!error && moduleDetail === undefined && <p className={styles.empty}>Chargement...</p>}

        {moduleDetail && !resource && <p className={styles.error}>Ressource introuvable.</p>}

        {resource && (
          <>
            <div className={styles.detailHead}>
              <div>
                <span className={styles.resourceHead}>
                  <ResourceIcon type={resource.resourceType} />
                  <span className={styles.resourceType}>{RESOURCE_TYPE_LABELS[resource.resourceType]}</span>
                </span>
                <h1 className={styles.title}>{resource.title}</h1>
              </div>
            </div>

            {EXTERNAL_LINK_TYPES.has(resource.resourceType) ? (
              <a
                className={homeStyles.btnPrimary}
                href={resource.content}
                target="_blank"
                rel="noreferrer noopener"
              >
                Ouvrir la ressource
              </a>
            ) : (
              <LessonContent text={resource.content} />
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
