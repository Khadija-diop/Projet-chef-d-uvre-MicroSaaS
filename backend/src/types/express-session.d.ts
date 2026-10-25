import "express-session";
import type { RoleCode } from "./roles.js";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: RoleCode;
  }
}
