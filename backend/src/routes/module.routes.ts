import { Router } from "express";

import { listModules } from "../controllers/module.controller.js";

export const moduleRouter = Router();

moduleRouter.get("/", listModules);
