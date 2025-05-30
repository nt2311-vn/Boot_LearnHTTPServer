import { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "./app/customError.js";
import {
  createChirp,
  deleteChirp,
  retrieveChirpById,
  retrieveChirps,
  retriveAllChirp,
  retriveChirpByAuthorId,
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

type SortValue = "asc" | "desc";
type Chirp = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  userId: string;
};

const sortedChirp = (chirps: Chirp[], sortValue?: SortValue) => {
  if (sortValue === "desc") {
    return chirps.sort(
      (chirp1, chirp2) =>
        new Date(chirp2.createdAt).getTime() -
        new Date(chirp1.createdAt).getTime(),
    );
  }

  return chirps.sort(
    (chirp1, chirp2) =>
      new Date(chirp1.createdAt).getTime() -
      new Date(chirp2.createdAt).getTime(),
  );
};

export const getChirpsHandler = async (req: Request, res: Response) => {
  const { authorId, sort } = req.query;
  if (!authorId) {
    const chirps = await retrieveChirps();
    const sorted = sortedChirp(chirps, sort as SortValue);
    res.status(200).json(sorted);
    return;
  }

  if (typeof authorId !== "string") {
    throw new BadRequestError("AuthorId must be an UUID");
  }

  const chirps = await retriveChirpByAuthorId(authorId);
  const sorted = sortedChirp(chirps, sort as SortValue);
  res.status(200).json(sorted);
  return;
};

export const getChirpByIdHandler = async (req: Request, res: Response) => {
  const chirpID = req.params.chirpID;

  if (!chirpID) {
    res.status(401).send("missing required params");
    return;
  }

  const chirp = await retrieveChirpById(chirpID);
  if (!chirp) {
    res.status(404).send("Not found");
    return;
  }

  res.status(200).json(chirp);
};

export const deleteChirpHandler = async (req: Request, res: Response) => {
  const chirpID = req.params.chirpID;
  if (!chirpID) {
    throw new BadRequestError("Missing chirp id");
  }

  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, envOrThrow("SECRET"));
    const chirp = await retrieveChirpById(chirpID);

    if (!chirp) {
      res.status(404).send("Not found any chirp");
      return;
    }

    if (chirp.userId !== userId) {
      res.status(403).send("unauthorized request");
      return;
    }

    await deleteChirp(chirpID);
    res.status(204).send("ok");
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
};
