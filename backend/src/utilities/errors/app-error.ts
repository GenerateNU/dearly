import { ZodError } from "zod";
import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { Status } from "../../constants/http";
import logger from "../monitoring/logger";

/**
 * Base interface for application-specific errors.
 * Extends the standard Error interface with a method to get the HTTP status code.
 */
interface AppError extends Error {
  getStatusCode: () => ContentfulStatusCode;
}

/**
 * Abstract base class for application-specific errors.
 * Implements the AppError interface and provides common error handling functionality.
 *
 * @property name - The name/type of the error
 * @property message - Descriptive message about what went wrong
 * @property statusCode - The HTTP status code to return
 */
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

/**
 * Error thrown when a requested resource is not found.
 * Returns HTTP 404 status code.
 *
 * @example
 * throw new NotFoundError("User")  // Message: "User does not exist."
 * throw new NotFoundError("Post", "Custom message") // Message: "Custom message"
 */
class NotFoundError extends AbstractAppError {
  constructor(resource: string, message: string = `${resource} does not exist.`) {
    super("NotFoundError", message, Status.NotFound);
  }
}

/**
 * Error thrown when an unexpected server error occurs.
 * Returns HTTP 500 status code.
 *
 * @example
 * throw new InternalServerError() // Message: "Internal Server Error"
 * throw new InternalServerError("Database connection failed")
 */
class InternalServerError extends AbstractAppError {
  constructor(message: string = "Internal Server Error") {
    super("InternalServerError", message, Status.InternalServer);
  }
}

/**
 * Error thrown when there is a conflict with the current state.
 * Returns HTTP 409 status code.
 *
 * @example
 * throw new ConflictError() // Message: "Conflict Error"
 * throw new ConflictError("Username already exists")
 */
class ConflictError extends AbstractAppError {
  constructor(message: string = "Conflict Error") {
    super("ConflictError", message, Status.Conflict);
  }
}

/**
 * Error thrown when too many requests have been made.
 * Returns HTTP 429 status code.
 *
 * @example
 * throw new TooManyRequestsError() // Message: "Too Many Requests Error"
 * throw new TooManyRequestsError("Rate limit exceeded")
 */
class TooManyRequestsError extends AbstractAppError {
  constructor(message: string = "Too Many Requests Error") {
    super("TooManyRequestsError", message, Status.TooManyRequests);
  }
}

/**
 * Error thrown when the user does not have permission to access a resource.
 * Returns HTTP 403 status code.
 *
 * @example
 * throw new ForbiddenError() // Message: "Forbidden"
 * throw new ForbiddenError("Insufficient permissions")
 */
class ForbiddenError extends AbstractAppError {
  constructor(message: string = "Forbidden") {
    super("ForbiddenError", message, Status.Forbidden);
  }
}

/**
 * Error thrown when a request is malformed or contains invalid data.
 * Returns HTTP 400 status code.
 *
 * @example
 * throw new BadRequestError() // Message: "Bad Request"
 * throw new BadRequestError("Invalid input format")
 */
class BadRequestError extends AbstractAppError {
  constructor(message: string = "Bad Request") {
    super("BadRequestError", message, Status.BadRequest);
  }
}

/**
 * Type guard to check if an unknown error is an AppError.
 * Used to safely handle and type errors in error handling middleware.
 *
 * @param error - The error to check
 * @returns True if the error is an instance of AbstractAppError, false otherwise
 */
const isAppError = (error: unknown): error is AppError => {
  return error instanceof AbstractAppError;
};

/**
 * Maps an unknown error to a response based on the error type.
 * Handles ZodError, SyntaxError, and AppError instances.
 *
 * @param error - The error to map
 * @param ctx - The context of the HTTP request
 * @returns A response object with the appropriate status code and message
 */
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

/**
 * Handles application errors by mapping them to a response.
 *
 * @param thunk - The function to execute
 * @returns A response object with the appropriate status code and message
 */
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
