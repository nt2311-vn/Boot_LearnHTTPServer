import { describe, it, expect, beforeAll } from "vitest";
import {
  checkPasswordHash,
  getBearerToken,
  hashPassword,
  makeJWT,
  validateJWT,
} from "./auth.js";
import { UnauthorizedError } from "./app/customError.js";
import { Request } from "express";
import { envOrThrow } from "./config.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT Functions", () => {
  const secret = "secret";
  const wrongSecret = "wrong_secret";
  const userID = "some-unique-user-id";
  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userID, 3600, secret);
  });

  it("should validate a valid token", () => {
    const result = validateJWT(validToken, secret);
    expect(result).toBe(userID);
  });

  it("should throw an error for an invalid token string", () => {
    expect(() => validateJWT("invalid.token.string", secret)).toThrow(
      UnauthorizedError,
    );
  });

  it("should throw an error when the token is signed with a wrong secret", () => {
    expect(() => validateJWT(validToken, wrongSecret)).toThrow(
      UnauthorizedError,
    );
  });
});

describe("Get bearer token", () => {
  it("should throw an error for invalid authorization header format", () => {
    const req = {
      headers: { authorization: "InvalidToken" },
      get: (header: string) => "InvalidToken",
    } as Request;
    expect(() => getBearerToken(req)).toThrow(UnauthorizedError);
    expect(() => getBearerToken(req)).toThrow(
      "Invalid authorization header format",
    );
  });

  it("should throw an error for non-Bearer authorization header", () => {
    const req = {
      headers: { authorization: "Basic token" },
      get: (header: string) => "Basic token",
    } as Request;
    expect(() => getBearerToken(req)).toThrow(UnauthorizedError);
    expect(() => getBearerToken(req)).toThrow(
      "Invalid authorization header format",
    );
  });

  it("should return token for valid Bearer authorization header", () => {
    const token = envOrThrow("SECRET");
    const req = {
      headers: { authorization: `Bearer ${token}` },
      get: (header: string) => `Bearer ${token}`,
    } as Request;
    const result = getBearerToken(req);
    expect(result).toBe(token);
  });
});
