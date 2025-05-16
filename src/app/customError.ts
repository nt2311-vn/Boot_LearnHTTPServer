class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError };
