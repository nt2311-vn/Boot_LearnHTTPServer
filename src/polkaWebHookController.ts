import { Request, Response } from "express";
import { updateRedMember } from "./db/queries/users.js";
import { getAPIKey } from "./auth.js";
import { envOrThrow } from "./config.js";

export const webhookHandler = async (req: Request, res: Response) => {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const params: parameters = req.body;

  if (!params) {
    res.status(401).send("Bad request");
    return;
  }

  try {
    const apiKey = getAPIKey(req);
    if (apiKey !== envOrThrow("POLKA_KEY")) {
      res.status(401).send("incorrect api key");
      return;
    }

    switch (params.event) {
      case "user.upgraded": {
        const user = await updateRedMember(params.data.userId);
        if (!user) {
          res.status(404).send("not found");
          return;
        }

        res.status(204).end();
        return;
      }
      default:
        res.status(204).end();
    }
  } catch (err) {
    res.status(401).send("unauthorized");
  }
};
