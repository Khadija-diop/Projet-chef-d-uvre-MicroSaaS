const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type AuthUser = {
  id: string;
  email: string;
  role: "learner" | "admin";
};

export type ModuleSummary = {
  id: string;
  title: string;
  shortDescription: string;
  learningObjective: string;
  displayOrder: number;
};

export type ModuleResourceItem = {
  id: string;
  title: string;
  content: string;
  resourceType: "article" | "video" | "link" | "checklist";
  displayOrder: number;
};

export type ModuleDetail = ModuleSummary & {
  resources: ModuleResourceItem[];
};

export type QuizChoice = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  displayOrder: number;
  choices: QuizChoice[];
};

export type Quiz = {
  id: string;
  questions: QuizQuestion[];
};

export type QuizAnswer = {
  questionId: string;
  choiceId: string;
};

export type QuizResult = {
  questionId: string;
  correctChoiceId: string;
  isCorrect: boolean;
};

export type QuizAttemptResult = {
  score: number;
  totalCount: number;
  results: QuizResult[];
};

export type Exercise = {
  id: string;
  prompt: string;
  submittedAnswer: string | null;
  modelAnswer: string | null;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    // Erreur reseau ou CORS : la requete n'a jamais atteint l'API
    throw new ApiError("Impossible de joindre le serveur", 0);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error ?? "Une erreur est survenue", response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function register(email: string, password: string) {
  return request<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<void>("/api/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return request<AuthUser | null>("/api/auth/me");
}

export function listModules() {
  return request<ModuleSummary[]>("/api/modules");
}

export function getModule(id: string) {
  return request<ModuleDetail>(`/api/modules/${id}`);
}

export function getQuiz(moduleId: string) {
  return request<Quiz>(`/api/modules/${moduleId}/quiz`);
}

export function submitQuizAttempt(moduleId: string, answers: QuizAnswer[]) {
  return request<QuizAttemptResult>(`/api/modules/${moduleId}/quiz/attempts`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function getExercise(moduleId: string) {
  return request<Exercise>(`/api/modules/${moduleId}/exercise`);
}

export function submitExercise(moduleId: string, answer: string) {
  return request<{ submittedAnswer: string; modelAnswer: string }>(
    `/api/modules/${moduleId}/exercise/completions`,
    { method: "POST", body: JSON.stringify({ answer }) },
  );
}
