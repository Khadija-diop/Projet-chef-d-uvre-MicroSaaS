"use client";

import { useParams } from "next/navigation";

import { AppShell } from "../../app-shell";
import { BackLink } from "../../back-link";
import { QuizSection } from "../../quiz";

export default function ModuleQuizPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AppShell active="modules">
      <BackLink href={`/parcours/${id}`} label="Retour au module" />

      <QuizSection moduleId={id} />
    </AppShell>
  );
}
