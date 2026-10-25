import { Router } from "express";

import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { moduleRouter } from "./module.routes.js";

export const router = Router();

// --- Routes publiques ---
router.use("/health", healthRouter);
router.use("/api/auth", authRouter);
router.use("/api/modules", moduleRouter);

// --- Zone administration : requireAuth + requireAdmin ---
// Monter ici les futurs routers réservés au rôle "admin" (chemins relatifs à
// /api/admin) : adminRouter.use("/modules", adminModulesRouter);
export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);
router.use("/api/admin", adminRouter);

// --- Zone authentifiée : requireAuth ---
// Monter ici les futurs routers protégés (chemins relatifs à /api) :
// protectedRouter.use("/progress", progressRouter);
export const protectedRouter = Router();
protectedRouter.use(requireAuth);
router.use("/api", protectedRouter);
