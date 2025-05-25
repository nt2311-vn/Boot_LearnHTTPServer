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

export const handlerLogin = async (req: Request, res: Response) => {
  type parameters = {
    password: string;
    email: string;
    expiresIn?: number;
  };

  const params: parameters = req.body;
  const user = await findUserByEmail(params.email);

  if (!user) {
    throw new UnauthorizedError("invalid username or password");
  }

  const matching = await checkPasswordHash(
    params.password,
    user.hashed_password,
  );

  if (!matching) {
    throw new UnauthorizedError("invalid username or password");
  }

  let duration = 3600;

  if (params.expiresIn && !(params.expiresIn > duration)) {
    duration = params.expiresIn;
  }

  const accessToken = makeJWT(user.id, duration, envOrThrow("SECRET"));
  const refreshToken = makeRefreshToken();
  const saved = await createRefreshToken(user.id, refreshToken);
  if (!saved) {
    throw new UnauthorizedError("could not save refresh token");
  }

  res.status(200).json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
    refreshToken: refreshToken,
    isChirpyRed: user.isChirpyRed,
  });
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
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UnauthorizedError("not validate JWT");
  }

  if (decoded.iss !== "chirpy") {
    throw new UnauthorizedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UnauthorizedError("No userid in token");
  }

  return decoded.sub;
};

export const getBearerToken = (req: Request): string => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new BadRequestError("No authorization header provided");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new BadRequestError("Invalid authorization header format");
  }

  return parts[1];
};

export const makeRefreshToken = () => {
  return randomBytes(32).toString("hex");
};

export const postRefreshToken = async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  const result = await isValidToken(token);

  if (!result) {
    res.status(401).send("Not validate token");
    return;
  }

  const { user } = result;
  const accessToken = makeJWT(user.id, 3600, envOrThrow("SECRET"));

  res.status(200).json({ token: accessToken });
};

export const revokeToken = async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  await updateRevokeToken(token);
  res.status(204).send();
};
