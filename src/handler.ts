import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { BadRequestError, ForbiddenError } from "./app/customError.js";
import { reset } from "./db/queries/users.js";

const handlerGetMetrics = async (_: Request, res: Response) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>
`);
};

const handlerResetMetrics = async (_: Request, res: Response) => {
  if (config.api.platform !== "dev") {
    console.log(config.api.platform);
    throw new ForbiddenError("Reset is only allowed in dev environment");
  }
  await reset();
  res.write("Hits reset to 0");
  res.end();
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
      throw new BadRequestError("Chirp is too long. Max length is 140");
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

  if (err instanceof BadRequestError) {
    res.status(400).send({ error: err.message });
  }
};

export {
  handlerResetMetrics,
  handlerReadiness,
  handlerGetMetrics,
  handlerChirp,
  errorHandler,
};
