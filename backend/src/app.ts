import cors from "cors";
import express from "express";
import session from "express-session";

import { errorHandler, notFoundHandler } from "./middlewares/errors.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET ?? "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
app.use(router);
app.use(notFoundHandler);
app.use(errorHandler);
