"use client";

import { useState } from "react";

import { ApiError, getQuiz, submitQuizAttempt, type QuizAttemptResult } from "@/lib/api";
import { useAsyncData } from "@/lib/use-async-data";

import homeStyles from "../page.module.css";
import styles from "./parcours.module.css";
import { ResourceIcon } from "./resource-icon";

export function QuizSection({ moduleId }: { moduleId: string }) {
  const { data: quiz, error } = useAsyncData(
    () => getQuiz(moduleId),
    [moduleId],
    "Impossible de charger ce quiz pour le moment.",
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!quiz) {
    return <p className={styles.empty}>Chargement...</p>;
  }

  const allAnswered = quiz.questions.every((question) => selectedAnswers[question.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quiz) {
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const answers = quiz.questions.map((question) => ({
        questionId: question.id,
        choiceId: selectedAnswers[question.id],
      }));
      setResult(await submitQuizAttempt(moduleId, answers));
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.status === 401
          ? "Connecte-toi pour valider ce quiz et enregistrer ton score."
          : "Impossible d'envoyer tes reponses pour le moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    setResult(null);
    setSelectedAnswers({});
    setSubmitError(null);
  }

  return (
    <section className={styles.quiz}>
      <div className={styles.quizHead}>
        <ResourceIcon type="quiz" />
        <h2>Quiz</h2>
      </div>
      <p className={styles.quizIntro}>Verifie ce que tu as retenu de ce module.</p>

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <fieldset key={question.id} className={styles.quizQuestion}>
            <legend>
              {index + 1}. {question.prompt}
            </legend>
            {question.choices.map((choice) => {
              const questionResult = result?.results.find((item) => item.questionId === question.id);
              const isCorrectChoice = questionResult?.correctChoiceId === choice.id;
              const isSelected = selectedAnswers[question.id] === choice.id;

              return (
                <label
                  key={choice.id}
                  className={`${styles.quizChoice} ${result && isCorrectChoice ? styles.quizChoiceCorrect : ""}`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={choice.id}
                    checked={isSelected}
                    disabled={Boolean(result)}
                    onChange={() => setSelectedAnswers((prev) => ({ ...prev, [question.id]: choice.id }))}
                  />
                  {choice.label}
                  {result && isCorrectChoice && <span className={styles.quizBadge}>Bonne reponse</span>}
                </label>
              );
            })}
          </fieldset>
        ))}

        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}

        {result ? (
          <div className={styles.quizResult}>
            <p>
              Score : {result.score} / {result.totalCount}
            </p>
            <button type="button" className={homeStyles.btnSecondary} onClick={handleRetry}>
              Reessayer
            </button>
          </div>
        ) : (
          <button type="submit" className={homeStyles.btnPrimary} disabled={!allAnswered || isSubmitting}>
            {isSubmitting ? "Envoi..." : "Valider mes reponses"}
          </button>
        )}
      </form>
    </section>
  );
}
