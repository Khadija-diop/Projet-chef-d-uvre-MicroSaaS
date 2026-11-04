import { Router } from "express";

import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import { adminModuleRouter } from "./adminModule.routes.js";
import { adminResourceRouter } from "./adminResource.routes.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { moduleRouter } from "./module.routes.js";
import { progressRouter } from "./progress.routes.js";

export const router = Router();

// --- Routes publiques ---
router.use("/health", healthRouter);
router.use("/api/auth", authRouter);
router.use("/api/modules", moduleRouter);

// --- Zone administration : requireAuth + requireAdmin ---
// Routers réservés au rôle "admin" (chemins relatifs à /api/admin).
export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);
adminRouter.use("/modules/:id/resources", adminResourceRouter);
adminRouter.use("/modules", adminModuleRouter);
router.use("/api/admin", adminRouter);

// --- Zone authentifiée : requireAuth ---
export const protectedRouter = Router();
protectedRouter.use(requireAuth);
protectedRouter.use("/progress", progressRouter);
router.use("/api", protectedRouter);
