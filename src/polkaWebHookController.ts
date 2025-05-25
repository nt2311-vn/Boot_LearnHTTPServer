import { Request, Response } from "express";
import { updateRedMember } from "./db/queries/users.js";

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

  switch (params.event) {
    case "user.upgraded": {
      const user = await updateRedMember(params.data.userId);
      if (!user) {
        res.status(404).send("not found");
        return;
      }

      res.status(204);
      return;
    }
    default:
      res.status(204).send("ok");
      return;
  }
};
