import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { refresh_tokens, NewRefreshToken, users } from "../schema.js";

export const createRefreshToken = async (token: NewRefreshToken) => {
  const rows = await db.insert(refresh_tokens).values(token).returning();

  return rows.length > 0;
};

export const isValidToken = async (token: string) => {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refresh_tokens, eq(users.id, refresh_tokens.userId))
    .where(
      and(
        eq(refresh_tokens.token, token),
        isNull(refresh_tokens.revokedAt),
        gt(refresh_tokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
};

export const updateRevokeToken = async (token: string) => {
  const rows = await db
    .update(refresh_tokens)
    .set({ expiresAt: new Date() })
    .where(eq(refresh_tokens.token, token))
    .returning();

  if (rows.length === 0) {
    throw new Error("Couldn't revoke token");
  }
};
