import { Router } from "express";

import { login, logout, me, register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import rateLimit from "express-rate-limit";

export const authRouter = Router();


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Trop de tentatives, reessayez dans quelques minutes" },
});

authRouter.post("/register",authLimiter, validate(registerSchema), register);
authRouter.post("/login", authLimiter, validate(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.get("/me", me);
