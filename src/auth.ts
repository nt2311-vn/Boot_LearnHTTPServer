import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

import { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "./app/customError.js";
import { findUserByEmail } from "./db/queries/users.js";
import { JwtPayload } from "jsonwebtoken";
import { envOrThrow } from "./config.js";
import {
  createRefreshToken,
  isValidToken,
  updateRevokeToken,
} from "./db/queries/refreshTokens.js";

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
    token: string;
    refreshToken: string;
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

  const expiresIn = 3600;
  const jwtToken = makeJWT(user.id, expiresIn, envOrThrow("SECRET"));

  const token = makeRefreshToken();
  const savedRefreshToken = await createRefreshToken({
    userId: user.id,
    token: token,
    revokedAt: null,
  });

  if (!savedRefreshToken) {
    throw new Error("Cannot create refresh token");
  }

  type PublicUserResp = Omit<DatabaseUser, "hashed_password">;
  const publicUser: PublicUserResp = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: jwtToken,
    refreshToken: savedRefreshToken.token,
  };

  res.status(200).json(publicUser);
};

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export const makeJWT = (
  userID: string,
  expiresIn: number,
  secret: string,
): string => {
  const currentTimeInSecs = Math.floor(Date.now() / 1000);
  const chirpPayload: payload = {
    iss: "chirpy",
    sub: userID,
    iat: currentTimeInSecs,
    exp: currentTimeInSecs + expiresIn,
  };
  return jwt.sign(chirpPayload, secret);
};

export const validateJWT = (tokenString: string, secret: string): string => {
  try {
    const extractPayload = jwt.verify(tokenString, secret);
    if (typeof extractPayload === "string") {
      throw new UnauthorizedError("not validate JWT");
    }

    return extractPayload.sub!;
  } catch (err) {
    throw new UnauthorizedError("not validate JWT");
  }
};

export const getBearerToken = (req: Request): string => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UnauthorizedError("No authorization header provided");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new UnauthorizedError("Invalid authorization header format");
  }

  return parts[1];
};

export const makeRefreshToken = () => {
  return randomBytes(32).toString("hex");
};

export const postRefreshToken = async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  const isValid = await isValidToken(token);

  if (!isValid) {
    res.status(401).send("Not validate token");
    return;
  }

  res.status(200).json({ token });
};

export const revokeToken = async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  const isValid = await isValidToken(token);

  if (!isValid) {
    res.status(401).send("Not validate token");
    return;
  }

  await updateRevokeToken(token);
};
