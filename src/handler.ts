import { Request, Response } from "express";
import { config } from "./config.js";

const handlerGetMetrics = async (_req: Request, res: Response) => {
  res.set("Content-Type", "text");
  res.status(200).send(`Hits: ${config.fileserverHits}`);
};

const handlerResetMetrics = async (_req: Request, res: Response) => {
  config.fileserverHits = 0;
  res.status(200).send("OK");
};

const handlerReadiness = async (req: Request, res: Response): Promise<void> => {
  res.set("Content-Type", "text");
  res.status(200).send("OK");
};

export { handlerResetMetrics, handlerReadiness, handlerGetMetrics };
