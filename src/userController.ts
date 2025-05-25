import { createUser, findUserByEmail, updateUser } from "./db/queries/users.js";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./app/customError.js";
import { getBearerToken, hashPassword, validateJWT } from "./auth.js";
import { envOrThrow } from "./config.js";
import { isValidToken } from "./db/queries/refreshTokens.js";
import { access } from "fs";

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

export const updateUserHandler = async (req: Request, res: Response) => {
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
    const subject = validateJWT(accessToken, envOrThrow("SECRET"));

    const hashedPass = await hashPassword(params.password);
    const updatedUser = await updateUser(subject, params.email, hashedPass);
    res.status(200).json({
      id: updatedUser.id,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.createdAt,
      email: updatedUser.email,
      isChirpyRed: updatedUser.isChirpyRed,
    });
  } catch (err) {
    res.status(401).send("Cannot update user password and email");
  }
};

export { createUserHandler };
