import cors from "cors";
import connectPgSimple from "connect-pg-simple";
import express from "express";
import session from "express-session";
import { errorHandler, notFoundHandler } from "./middlewares/errors.js";
import { router } from "./routes/index.js";
import helmet from "helmet";

function resolveSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length > 0) {
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return "dev-secret";
}

const sessionSecret = resolveSessionSecret();
const PgSessionStore = connectPgSimple(session);
export const app = express();
const trustedProxies = Number(process.env.TRUST_PROXY ?? 0);
if (trustedProxies > 0) {
  app.set("trust proxy", trustedProxies);
}
app.use(helmet());
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
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store:
      process.env.NODE_ENV === "test"
        ? undefined
        : new PgSessionStore({ conString: process.env.DATABASE_URL }),
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
