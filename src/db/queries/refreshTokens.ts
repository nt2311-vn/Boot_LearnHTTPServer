import { db } from "..";
import { refresh_tokens, NewRefreshToken } from "../schema.js";

export const createRefreshToken = async (token: NewRefreshToken) => {
  const [refreshToken] = await db
    .insert(refresh_tokens)
    .values(token)
    .onConflictDoNothing()
    .returning();

  return refreshToken;
};
