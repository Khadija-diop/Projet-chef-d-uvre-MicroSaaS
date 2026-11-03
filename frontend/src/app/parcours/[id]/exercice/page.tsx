"use client";

import { useParams } from "next/navigation";

import { AppShell } from "../../app-shell";
import { BackLink } from "../../back-link";
import { ExerciseSection } from "../../exercise";

export default function ModuleExercisePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AppShell active="modules">
      <BackLink href={`/parcours/${id}`} label="Retour au module" />

      <ExerciseSection moduleId={id} />
    </AppShell>
  );
}
