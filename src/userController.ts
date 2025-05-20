import { createUser } from "./db/queries/users";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./app/customError";

const createUserHandler = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await createUser({ email: params.email });

  if (!user) {
    throw new Error("Could not create user");
  }

  res.status(201).json(user);
};

export { createUserHandler };
