import { createUser } from "./db/queries/users.js";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./app/customError.js";
import { hashPassword } from "./auth.js";

const createUserHandler = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPass = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashed_password: hashedPass,
  });

  if (!user) {
    throw new Error("Could not create user");
  }

  res.status(201).json(user);
};

export { createUserHandler };
