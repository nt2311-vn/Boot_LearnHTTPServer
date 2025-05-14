import { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

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

export { middlewareMetricsInc, middlewareLogResponses };
