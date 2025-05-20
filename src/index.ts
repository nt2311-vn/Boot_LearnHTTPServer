import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import {
  handlerGetMetrics,
  handlerReadiness,
  handlerResetMetrics,
  handlerChirp,
  errorHandler,
} from "./handler.js";

const app = express();

import { config } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUserHandler } from "./userController.js";
import { createChirpHandler } from "./chirpController.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(express.json());
app.use(errorHandler);

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerGetMetrics);
app.post("/admin/reset", handlerResetMetrics);
// app.post("/api/validate_chirp", handlerChirp, errorHandler);
app.post("/api/users", (req, res, next) => {
  Promise.resolve(createUserHandler(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(createChirpHandler(req, res)).catch(next);
});

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
