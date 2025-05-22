import bcrypt from "bcrypt";

import { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "./app/customError.js";
import { findUserByEmail } from "./db/queries/users.js";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const checkPasswordHash = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const login = async (req: Request, res: Response) => {
  type LoginInput = {
    email: string;
    password: string;
  };

  type DatabaseUser = {
    id: string;
    updatedAt: Date;
    createdAt: Date;
    email: string;
    hashed_password: string;
  };

  const loginInput: LoginInput = req.body;

  if (!loginInput.password || !loginInput.email) {
    throw new BadRequestError("Missing required fields on body");
  }

  const user = await findUserByEmail(loginInput.email);
  if (!user) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const isAuthenticated = await checkPasswordHash(
    loginInput.password,
    user.hashed_password,
  );

  if (!isAuthenticated) {
    res.status(401).send("incorrect email or password");
    return;
  }

  type PublicUserResp = Omit<DatabaseUser, "hashed_password">;
  const publicUser: PublicUserResp = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  };

  res.status(200).json(publicUser);
};
