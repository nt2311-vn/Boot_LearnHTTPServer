import express from "express";
import {
  authenticateJWT,
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./middleware.js";
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
import {
  createChirpHandler,
  getChirpByIdHandler,
  getChirpsHandler,
} from "./chirpController.js";
import {
  getBearerToken,
  login,
  postRefreshToken,
  revokeToken,
} from "./auth.js";

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
app.post("/api/chirps", authenticateJWT, (req, res, next) => {
  Promise.resolve(createChirpHandler(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(getChirpsHandler(req, res)).catch(next);
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(getChirpByIdHandler(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
  Promise.resolve(login(req, res)).catch(next);
});

app.post("/api/refresh", authenticateJWT, (req, res, next) => {
  Promise.resolve(postRefreshToken(req, res)).catch(next);
});

app.post("/api/revoke", authenticateJWT, (req, res, next) => {
  Promise.resolve(revokeToken(req, res)).catch(next);
});

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
