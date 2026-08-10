import "express-session";
import type { UserRole } from "@prisma/client";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: UserRole;
  }
}
