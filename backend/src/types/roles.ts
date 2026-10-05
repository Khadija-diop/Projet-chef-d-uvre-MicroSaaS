export const ROLE_CODES = {
  LEARNER: "learner",
  ADMIN: "admin",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];
