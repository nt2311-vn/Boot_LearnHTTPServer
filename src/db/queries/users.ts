import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function reset() {
  await db.delete(users);
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      hashed_password: users.hashed_password,
      isChirpyRed: users.isChirpyRed,
    })
    .from(users)
    .where(eq(users.email, email));

  return user;
}

export const updateUser = async (
  id: string,
  email: string,
  hashedPassword: string,
) => {
  const [user] = await db
    .update(users)
    .set({ email: email, hashed_password: hashedPassword })
    .where(eq(users.id, id))
    .returning();

  return user;
};

export const updateRedMember = async (userID: string) => {
  const [user] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, userID))
    .returning();

  return user;
};
