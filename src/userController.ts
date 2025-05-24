import { createUser, findUserByEmail, updateUser } from "./db/queries/users.js";
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
    return;
  }

  try {
    const accessToken = getBearerToken(req);
    const userId = validateJWT(accessToken, envOrThrow("SECRET"));
    const user = await findUserByEmail(params.email);

    if (user.id !== userId) {
      res.status(401).send("Unauthorized user");
    }

    const hashedPass = await hashPassword(params.password);
    await updateUser(params.email, hashedPass);
  } catch (err) {
    res.status(401).send("Cannot update user password and email");
  }
};

export { createUserHandler };
