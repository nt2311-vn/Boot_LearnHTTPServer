import { Request, Response } from "express";
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

const handlerChirp = async (req: Request, res: Response) => {
  type Chirp = {
    body: string;
  };

  let body = "";
  req.setEncoding("utf8");
  req.on("data", (chunk: string) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const chirp: Chirp = JSON.parse(body);

      if (chirp.body.length > 140) {
        res.status(400).send({ error: "Chirp is too long" });
      }
      res.status(200).send({ valid: true });
    } catch (err) {
      res.status(400).send({ error: "Something went wrong" });
    }
  });

  req.on("error", (err) => {
    res.status(500).send({ error: "Something went wrong" });
  });
};

export {
  handlerResetMetrics,
  handlerReadiness,
  handlerGetMetrics,
  handlerChirp,
};
