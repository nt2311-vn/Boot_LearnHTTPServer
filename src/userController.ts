import { NewUser } from "./db/schema";
import { createUser } from "./db/queries/users";
import { NextFunction, Response } from "express";

type RequestUser = {
  email: string;
};

const createUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(401).json({ error: "Invalid email" });
    }

    const newUser: NewUser = { email };
    const user = await createUser(newUser);

    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export { createUserHandler };
