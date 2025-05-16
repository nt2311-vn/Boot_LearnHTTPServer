import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import {
  handlerGetMetrics,
  handlerReadiness,
  handlerResetMetrics,
  handlerChirp,
} from "./handler.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(express.json());

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerGetMetrics);
app.post("/admin/reset", handlerResetMetrics);
app.post("/api/validate_chirp", handlerChirp);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
