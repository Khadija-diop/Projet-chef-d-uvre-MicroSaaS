export const ROLE_CODES = {
  LEARNER: "learner",
  ADMIN: "admin",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

/**
 * Convertit le code lu en base (simple chaine) en RoleCode.
 * Leve une erreur si la base contient un role inconnu du code.
 */
export function toRoleCode(code: string): RoleCode {
  if (code === ROLE_CODES.LEARNER || code === ROLE_CODES.ADMIN) {
    return code;
  }
  throw new Error(`Unknown role code: ${code}`);
}
