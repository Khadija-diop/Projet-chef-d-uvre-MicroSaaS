"use client";

import { useState } from "react";

import { ApiError, getExercise, submitExercise } from "@/lib/api";
import { useAsyncData } from "@/lib/use-async-data";

import { LessonContent } from "./lesson-content";
import homeStyles from "../page.module.css";
import styles from "./parcours.module.css";
import { ResourceIcon } from "./resource-icon";

type SubmissionResult = { submittedAnswer: string; modelAnswer: string };

export function ExerciseSection({ moduleId }: { moduleId: string }) {
  const { data: exercise, error } = useAsyncData(
    () => getExercise(moduleId),
    [moduleId],
    "Impossible de charger cet exercice pour le moment.",
  );
  const [freshResult, setFreshResult] = useState<SubmissionResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!exercise) {
    return <p className={styles.empty}>Chargement...</p>;
  }

  // La reponse modele reste masquee tant que rien n'a ete soumis (fraichement ou lors
  // d'une visite precedente) ; "editer" l'efface localement le temps de resoumettre.
  const revealed =
    !isEditing && (freshResult ?? (exercise.modelAnswer ? { submittedAnswer: exercise.submittedAnswer ?? "", modelAnswer: exercise.modelAnswer } : null));

  function startEditing(previousAnswer: string) {
    setDraftAnswer(previousAnswer);
    setIsEditing(true);
    setSubmitError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      setFreshResult(await submitExercise(moduleId, draftAnswer));
      setIsEditing(false);
    } catch (caughtError) {
      setSubmitError(
        caughtError instanceof ApiError && caughtError.status === 401
          ? "Connecte-toi pour soumettre ta reponse et voir la reponse modele."
          : "Impossible d'envoyer ta reponse pour le moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.quiz}>
      <div className={styles.quizHead}>
        <ResourceIcon type="exercise" />
        <h2>Exercice</h2>
      </div>
      <p className={styles.quizIntro}>
        Applique ce module concretement sur ce depot. Ta reponse n&apos;est pas executee ni notee
        automatiquement : compare-la a la reponse modele pour t&apos;auto-corriger.
      </p>

      <div className={styles.exercisePrompt}>
        <LessonContent text={exercise.prompt} />
      </div>

      {revealed ? (
        <div className={styles.exerciseAnswers}>
          <div className={styles.exerciseAnswerBlock}>
            <span className={styles.exerciseAnswerLabel}>Ta reponse</span>
            {/* Texte libre tape par l'apprenant : affiche tel quel (pre-wrap), pas
                de rendu markdown qui fusionnerait ses propres retours a la ligne. */}
            <p className={styles.exerciseRawAnswer}>{revealed.submittedAnswer}</p>
          </div>
          <div className={`${styles.exerciseAnswerBlock} ${styles.exerciseModelAnswer}`}>
            <span className={styles.exerciseAnswerLabel}>Reponse modele</span>
            <LessonContent text={revealed.modelAnswer} />
          </div>
          <div>
            <button
              type="button"
              className={homeStyles.btnSecondary}
              onClick={() => startEditing(revealed.submittedAnswer)}
            >
              Modifier ma reponse
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className={styles.exerciseAnswerLabel} htmlFor="exercise-answer">
            Ta reponse
          </label>
          <textarea
            id="exercise-answer"
            className={styles.exerciseTextarea}
            value={draftAnswer}
            onChange={(event) => setDraftAnswer(event.target.value)}
            required
          />

          {submitError && (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" className={homeStyles.btnPrimary} disabled={!draftAnswer.trim() || isSubmitting}>
            {isSubmitting ? "Envoi..." : "Soumettre et voir la reponse modele"}
          </button>
        </form>
      )}
    </section>
  );
}
