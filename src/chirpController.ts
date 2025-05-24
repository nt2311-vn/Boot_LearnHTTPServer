import { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "./app/customError.js";
import {
  createChirp,
  retrieveChirpById,
  retrieveChirps,
} from "./db/queries/chirps.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { envOrThrow } from "./config.js";
import { a } from "vitest/dist/chunks/suite.d.FvehnV49.js";

export const createChirpHandler = async (req: Request, res: Response) => {
  const { body } = req.body;

  if (!body) {
    throw new BadRequestError("Missing required fields");
  }

  const token = getBearerToken(req);
  try {
    const userId = validateJWT(token, envOrThrow("SECRET"));
    const chirp = await createChirp({ userId: userId, body });

    res.status(201).json(chirp);
  } catch (err) {
    res.status(401).send("not authorized");
  }
};

export const getChirpsHandler = async (_: Request, res: Response) => {
  const chirps = await retrieveChirps();

  if (!chirps) {
    throw new Error("Cannot create chirp");
  }

  res.status(200).json(chirps);
};

export const getChirpByIdHandler = async (req: Request, res: Response) => {
  const chirpID = req.params.chirpID;

  if (!chirpID) {
    throw new BadRequestError("Missing chirp id to retrieve");
  }

  const chirp = await retrieveChirpById(chirpID);

  if (!chirp) {
    throw new NotFoundError(`Cannot find chirp with id ${chirpID}`);
  }

  res.status(200).json(chirp);
};
