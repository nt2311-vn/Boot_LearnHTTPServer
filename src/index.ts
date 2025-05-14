import express, { NextFunction, Request, Response } from "express";
import { config } from "./config";

const app = express();
const PORT = 8080;
const middlewareMetricsInc = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  config.fileserverHits++;
  next();
};

const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
};

const handlerGetMetrics = async (_req: Request, res: Response) => {
  res.set("Content-Type", "text");
  res.status(200).send(`Hits: ${config.fileserverHits}`);
};

const handlerResetMetrics = async (_req: Request, _res: Response) => {
  config.fileserverHits = 0;
};

app.use(middlewareLogResponses, middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

const handlerReadiness = async (req: Request, res: Response): Promise<void> => {
  res.set("Content-Type", "text");
  res.status(200).send("OK");
};

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerGetMetrics);
app.get("/reset", handlerResetMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
