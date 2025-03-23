import { z } from "zod";
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "./app-error";
import logger from "../monitoring/logger";
import { getFriendlyErrorMessage } from "./friendly-errors";
import { DatabaseErrorSchema, DatabaseErrorType } from "../../constants/db-error";

type DatabaseError = z.infer<typeof DatabaseErrorSchema>;

/**
 * Checks if an error is a database error.
 *
 * @param error - The error to check
 * @returns True if the error is a database error, false otherwise
 */
const isDatabaseError = (error: unknown): error is DatabaseError => {
  try {
    DatabaseErrorSchema.parse(error);
    return true;
  } catch {
    return false;
  }
};

/**
 * Maps database error codes to handlers that convert them into app errors.
 *
 * @type {Partial<Record<DatabaseErrorType, (error: DatabaseError) => AppError>}
 */
const DB_ERROR_TO_APP_ERROR_MAP: Partial<
  Record<DatabaseErrorType, (error: DatabaseError) => AppError>
> = {
  [DatabaseErrorType.UniqueConstraintViolation]: (error) => {
    const { table_name, detail } = error;
    return new ConflictError(getFriendlyErrorMessage(table_name!, detail));
  },
  [DatabaseErrorType.ForeignKeyViolation]: (error) => {
    const { table_name, detail } = error;
    return new NotFoundError("", getFriendlyErrorMessage(table_name!, detail));
  },
  [DatabaseErrorType.CheckConstraintViolation]: () =>
    new BadRequestError(`The value provided is out of the acceptable range.`),
  [DatabaseErrorType.NullValueNotAllowed]: () => new BadRequestError(`Null value is not allowed`),
  [DatabaseErrorType.ConnectionFailure]: () =>
    new InternalServerError(`Database connection failure. Please try again later.`),
};

/**
 * Maps a database error to an app error.
 *
 * @param error - The database error to map
 * @returns The mapped app error
 */
const mapDBErrorToAppError = (error: unknown): AppError => {
  const dbError = DatabaseErrorSchema.safeParse(error);
  const fallbackServerError = new InternalServerError("An unexpected database error occurred.");

  if (!dbError.success) {
    logger.error("Invalid database error:", error);
    return fallbackServerError;
  }

  const { code, detail, message } = dbError.data;
  logger.error(formatDBLogError(code, detail, message));

  // search for app error associated with database error code in the map
  const formatDBErrorHandler = DB_ERROR_TO_APP_ERROR_MAP[code];

  if (formatDBErrorHandler) {
    return formatDBErrorHandler(dbError.data);
  }

  return fallbackServerError;
};

/**
 * Formats a database error for logging.
 *
 * @param code - The database error code
 * @param detail - The database error detail
 * @param message - The database error message
 */
const formatDBLogError = (code: string, detail: string, message: string) => {
  return `
[DATABASE ERROR]
-------------------------------------------
Code:    ${code}
Detail:  ${detail}
Message: ${message}
-------------------------------------------
`;
};

export { isDatabaseError, mapDBErrorToAppError };
