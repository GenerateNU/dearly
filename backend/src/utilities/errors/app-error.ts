import { ZodError } from "zod";
import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { Status } from "../../constants/http";
import logger from "../monitoring/logger";

interface AppError extends Error {
  getStatusCode: () => ContentfulStatusCode;
}

abstract class AbstractAppError implements AppError {
  readonly name: string;
  readonly message: string;
  private readonly statusCode: ContentfulStatusCode;

  protected constructor(name: string, message: string, statusCode: ContentfulStatusCode) {
    this.name = name;
    this.message = message;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }

  public getStatusCode(): ContentfulStatusCode {
    return this.statusCode as ContentfulStatusCode;
  }
}

class NotFoundError extends AbstractAppError {
  constructor(resource: string, message: string = `${resource} does not exist.`) {
    super("NotFoundError", message, Status.NotFound);
  }
}

class InternalServerError extends AbstractAppError {
  constructor(message: string = "Internal Server Error") {
    super("InternalServerError", message, Status.InternalServer);
  }
}

class ConflictError extends AbstractAppError {
  constructor(message: string = "Conflict Error") {
    super("ConflictError", message, Status.Conflict);
  }
}

class TooManyRequestsError extends AbstractAppError {
  constructor(message: string = "Too Many Requests Error") {
    super("TooManyRequestsError", message, Status.TooManyRequests);
  }
}

class ForbiddenError extends AbstractAppError {
  constructor(message: string = "Forbidden") {
    super("ForbiddenError", message, Status.Forbidden);
  }
}

class BadRequestError extends AbstractAppError {
  constructor(message: string = "Bad Request") {
    super("BadRequestError", message, Status.BadRequest);
  }
}

const isAppError = (error: unknown): error is AppError => {
  return error instanceof AbstractAppError;
};

const mapAppErrorToResponse = (error: unknown, ctx: Context) => {
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    return ctx.json({ message: "Validation failed", errors: formattedErrors }, Status.BadRequest);
  } else if (error instanceof SyntaxError) {
    return ctx.json({ error: error.message }, Status.BadRequest);
  } else if (isAppError(error)) {
    return ctx.json({ error: error.message }, error.getStatusCode());
  }
  logger.error("Unexpected error occurred: ", error);
  return ctx.json({ error: "Unexpected error occured. Please try again." }, Status.InternalServer);
};

const handleAppError = <T>(thunk: () => T) => {
  return async (ctx: Context) => {
    try {
      return await thunk();
    } catch (error) {
      return mapAppErrorToResponse(error, ctx);
    }
  };
};

export {
  isAppError,
  handleAppError,
  ForbiddenError,
  ConflictError,
  AppError,
  NotFoundError,
  InternalServerError,
  BadRequestError,
  TooManyRequestsError,
};
