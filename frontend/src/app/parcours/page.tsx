"use client";

import Link from "next/link";

import { listModules } from "@/lib/api";
import { useAsyncData } from "@/lib/use-async-data";

import { SiteFooter, SiteHeader } from "../site-shell";
import homeStyles from "../page.module.css";
import styles from "./parcours.module.css";

export default function ParcoursPage() {
  const { data: modules, error } = useAsyncData(
    listModules,
    [],
    "Impossible de charger le parcours pour le moment.",
  );

  return (
    <div className={homeStyles.page}>
      <SiteHeader />

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
              <li key={module.id}>
                <Link
                  href={`/parcours/${module.id}`}
                  className={styles.moduleRow}
                  aria-label={module.title}
                >
                  <span className={styles.moduleRowOrder}>{String(module.displayOrder).padStart(2, "0")}</span>
                  <span className={styles.moduleRowBody}>
                    <h2>{module.title}</h2>
                    <p>{module.shortDescription}</p>
                  </span>
                  <svg className={styles.moduleRowChevron} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
