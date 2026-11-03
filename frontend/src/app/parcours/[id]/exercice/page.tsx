"use client";

import { useParams } from "next/navigation";

import { BackLink } from "../../back-link";
import { ExerciseSection } from "../../exercise";
import { SiteFooter, SiteHeader } from "../../../site-shell";
import homeStyles from "../../../page.module.css";
import styles from "../../parcours.module.css";

export default function ModuleExercisePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={homeStyles.page}>
      <SiteHeader />

      <main className={styles.main}>
        <BackLink href={`/parcours/${id}`} label="Retour au module" />

        <ExerciseSection moduleId={id} />
      </main>

      <SiteFooter />
    </div>
  );
}
