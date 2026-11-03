"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getProgress, listModules, type ProgressStatus } from "@/lib/api";
import { useAsyncData } from "@/lib/use-async-data";

import { FocusHeading } from "../focus-heading";
import { AppShell } from "./app-shell";
import { ChevronIcon } from "./icons";
import styles from "./parcours.module.css";
import { StatusBadge } from "./status-badge";

export default function ParcoursPage() {
  const { data: modules, error } = useAsyncData(
    listModules,
    [],
    "Impossible de charger le parcours pour le moment.",
  );
  const [statusByModuleId, setStatusByModuleId] = useState<Record<string, ProgressStatus>>({});
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    async function loadProgress() {
      try {
        const overview = await getProgress();
        setPercentage(overview.percentage);
        setStatusByModuleId(
          Object.fromEntries(overview.modules.map((module) => [module.id, module.status])),
        );
      } catch {
        // La progression n'a pas pu être chargée : les modules restent affichés en "à faire".
      }
    }
    loadProgress();
  }, []);

  return (
    <AppShell active="modules">
      <h1 className={styles.pageTitle}>Vos modules</h1>
      <FocusHeading />
      <p className={styles.pageLede}>Le parcours est ordonné : suis-le dans l&apos;ordre pour progresser efficacement.</p>

      {!error && modules && modules.length > 0 && (
        <div className={styles.progressSummary}>
          <div className={styles.progressSummaryTop}>
            <strong>Progression globale</strong>
            <span className={styles.progressPercentage}>{percentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFill} style={{ width: `${percentage}%` }} />
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!error && modules === undefined && <p className={styles.empty}>Chargement...</p>}

      {!error && modules?.length === 0 && (
        <p className={styles.empty}>Aucun module n&apos;est publie pour le moment.</p>
      )}

      {modules && modules.length > 0 && (
        <ol className={styles.moduleList}>
          {modules.map((module) => (
            <li key={module.id}>
              <Link href={`/parcours/${module.id}`} className={styles.moduleRow} aria-label={module.title}>
                <span className={styles.moduleRowOrder}>{String(module.displayOrder).padStart(2, "0")}</span>
                <span className={styles.moduleRowBody}>
                  <h2>{module.title}</h2>
                  <p>{module.shortDescription}</p>
                </span>
                <StatusBadge status={statusByModuleId[module.id] ?? "todo"} />
                <ChevronIcon className={styles.moduleRowChevron} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </AppShell>
  );
}
