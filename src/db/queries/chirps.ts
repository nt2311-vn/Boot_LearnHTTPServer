import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export const createChirp = async (chirp: NewChirp) => {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();

  return result;
};

export const retrieveChirps = async () => {
  const results = await db
    .select({
      id: chirps.id,
      createdAt: chirps.createdAt,
      updatedAt: chirps.updatedAt,
      body: chirps.body,
      userId: chirps.userId,
    })
    .from(chirps);

  return results;
};

export const retrieveChirpById = async (chirpID: string) => {
  const [result] = await db
    .select({
      id: chirps.id,
      createdAt: chirps.createdAt,
      updatedAt: chirps.updatedAt,
      body: chirps.body,
      userId: chirps.userId,
    })
    .from(chirps)
    .where(eq(chirps.id, chirpID));

  return result;
};

export const retriveAllChirp = async () => {
  const results = await db.select({ body: chirps.body }).from(chirps);
  return results;
};

export const retriveChirpByAuthorId = async (authorId: string) => {
  const results = await db
    .select({
      id: chirps.id,
      createdAt: chirps.createdAt,
      updatedAt: chirps.updatedAt,
      body: chirps.body,
      userId: chirps.userId,
    })
    .from(chirps)
    .where(eq(chirps.userId, authorId));

  return results;
};

export const deleteChirp = async (chirpID: string) => {
  await db.delete(chirps).where(eq(chirps.id, chirpID));
};
