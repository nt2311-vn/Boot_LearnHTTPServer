import { Request, Response } from "express";
import { BadRequestError } from "./app/customError.js";
import { createChirp } from "./db/queries/chirps.js";

export const createChirpHandler = async (req: Request, res: Response) => {
  type ChirpRequest = {
    body: string;
    userId: string;
  };

  const params: ChirpRequest = req.body;

  if (!params.body || !params.userId) {
    throw new BadRequestError("Missing required fields");
  }

  const chirp = await createChirp({ userId: params.userId, body: params.body });

  if (!chirp) {
    throw new Error("Cannot create chirp");
  }

  res.status(201).json(chirp);
};
