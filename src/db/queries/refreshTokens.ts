import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refresh_tokens, NewRefreshToken } from "../schema.js";

export const createRefreshToken = async (token: NewRefreshToken) => {
  const [refreshToken] = await db
    .insert(refresh_tokens)
    .values(token)
    .onConflictDoNothing()
    .returning();

  return refreshToken;
};

export const isValidToken = async (token: string) => {
  const [foundToken] = await db
    .select({
      token: refresh_tokens.token,
      expiresIn: refresh_tokens.expiresAt,
    })
    .from(refresh_tokens)
    .where(eq(refresh_tokens.token, token));

  return (
    foundToken.token === token &&
    foundToken.expiresIn.getTime() > new Date().getTime()
  );
};

export const updateRevokeToken = async (token: string) => {
  await db
    .update(refresh_tokens)
    .set({ revokedAt: new Date() })
    .where(eq(refresh_tokens.token, token))
    .returning();
};
