import express from "express";

import { errorHandler, notFoundHandler } from "./middlewares/errors.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(express.json());
app.use(router);
app.use(notFoundHandler);
app.use(errorHandler);
