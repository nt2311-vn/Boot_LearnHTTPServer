import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";

const handlerGetMetrics = async (_req: Request, res: Response) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
      </body>
    </html>
`);
};

const handlerResetMetrics = async (_req: Request, res: Response) => {
  config.fileserverHits = 0;
  res.status(200).send("OK");
};

const handlerReadiness = async (req: Request, res: Response): Promise<void> => {
  res.set("Content-Type", "text");
  res.status(200).send("OK");
};

const handlerChirp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  type Chirp = {
    body: string;
  };

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];

  try {
    const chirp: Chirp = req.body;

    if (chirp.body.length > 140) {
      throw new Error("Something went wrong on our end");
    }

    const words = chirp.body.split(" ");

    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (profaneWords.includes(word)) {
        words[i] = "****";
      }
    }

    res.status(200).send({ cleanedBody: words.join(" ") });
  } catch (err) {
    next(err);
  }
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end" });
};

export {
  handlerResetMetrics,
  handlerReadiness,
  handlerGetMetrics,
  handlerChirp,
  errorHandler,
};
