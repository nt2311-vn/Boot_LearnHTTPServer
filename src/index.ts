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
const PORT = 8080;

import { config } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(express.json());
app.use(errorHandler);

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerGetMetrics);
app.post("/admin/reset", handlerResetMetrics);
app.post("/api/validate_chirp", handlerChirp, errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
