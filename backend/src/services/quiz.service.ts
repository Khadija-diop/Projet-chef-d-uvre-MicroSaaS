import { AppError } from "../middlewares/errors.js";
import { createQuizAttempt, findQuizByModuleId } from "../repositories/quiz.repository.js";

type AnswerInput = { questionId: string; choiceId: string };

async function findQuizOrThrow(moduleId: string) {
  const quiz = await findQuizByModuleId(moduleId);
  if (!quiz) {
    throw new AppError(404, "Aucun quiz pour ce module");
  }

  return quiz;
}

export async function getQuizForModule(moduleId: string) {
  const quiz = await findQuizOrThrow(moduleId);

  return {
    id: quiz.id,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      displayOrder: question.displayOrder,
      choices: question.choices.map((choice) => ({ id: choice.id, label: choice.label })),
    })),
  };
}

export async function submitQuizAttempt(moduleId: string, userId: string, answers: AnswerInput[]) {
  const quiz = await findQuizOrThrow(moduleId);

  const choiceIdByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.choiceId]));

  let score = 0;
  const results = quiz.questions.map((question) => {
    const correctChoice = question.choices.find((choice) => choice.isCorrect);
    if (!correctChoice) {
      throw new AppError(500, "Question mal configuree : aucune reponse correcte definie");
    }

    const submittedChoiceId = choiceIdByQuestionId.get(question.id);
    if (submittedChoiceId !== undefined && !question.choices.some((choice) => choice.id === submittedChoiceId)) {
      throw new AppError(400, "Reponse invalide pour une question de ce quiz");
    }

    const isCorrect = submittedChoiceId === correctChoice.id;
    if (isCorrect) {
      score += 1;
    }

    return { questionId: question.id, correctChoiceId: correctChoice.id, isCorrect };
  });

  const totalCount = quiz.questions.length;
  await createQuizAttempt(userId, quiz.id, score, totalCount);

  return { score, totalCount, results };
}
