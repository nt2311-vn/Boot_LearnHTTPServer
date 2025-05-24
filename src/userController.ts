import { createUser, findUserByEmail } from "./db/queries/users.js";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./app/customError.js";
import { getBearerToken, hashPassword, validateJWT } from "./auth.js";
import { envOrThrow } from "./config.js";

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

const updateUserHandler = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
    password: string;
  };

  const params: parameters = req.body;
  if (!params.email || !params.password) {
    res.status(401).send("Missing required fields");
  }

  try {
    const accessToken = getBearerToken(req);
    const userId = validateJWT(accessToken, envOrThrow("SECRET"));
    const user = findUserByEmail(params.email);
  } catch (err) {}
};

export { createUserHandler };
