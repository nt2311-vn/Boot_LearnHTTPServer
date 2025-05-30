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
import { createUserHandler, updateUserHandler } from "./userController.js";
import {
  createChirpHandler,
  deleteChirpHandler,
  getChirpByIdHandler,
  getChirpsHandler,
} from "./chirpController.js";
import {
  getBearerToken,
  handlerLogin,
  postRefreshToken,
  revokeToken,
} from "./auth.js";
import { webhookHandler } from "./polkaWebHookController.js";

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
app.put("/api/users", (req, res, next) => {
  Promise.resolve(updateUserHandler(req, res).catch(next));
});
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(createChirpHandler(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(getChirpsHandler(req, res)).catch(next);
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(getChirpByIdHandler(req, res)).catch(next);
});

app.delete("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(deleteChirpHandler(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});

app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(postRefreshToken(req, res)).catch(next);
});

app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(revokeToken(req, res)).catch(next);
});

app.post("/api/polka/webhooks", (req, res, next) => {
  Promise.resolve(webhookHandler(req, res)).catch(next);
});

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
