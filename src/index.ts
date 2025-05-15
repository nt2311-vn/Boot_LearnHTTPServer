import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import {
  handlerGetMetrics,
  handlerReadiness,
  handlerResetMetrics,
} from "./handler.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerGetMetrics);
app.post("/admin/reset", handlerResetMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
