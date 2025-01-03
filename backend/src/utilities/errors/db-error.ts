import { z } from "zod";
import { AppError, BadRequestError, ConflictError, InternalServerError } from "./app-error";
import logger from "../logger";
import { formatConflictError } from "./db-conflict";
import { DatabaseErrorSchema, DatabaseErrorType } from "../../constants/db-error";

type DatabaseError = z.infer<typeof DatabaseErrorSchema>;

// check if error is database error
const isDatabaseError = (error: unknown): error is DatabaseError => {
  try {
    DatabaseErrorSchema.parse(error);
    return true;
  } catch {
    return false;
  }
};

// object that maps database error code to handler that converts it into app error
const DB_ERROR_TO_APP_ERROR_MAP: Partial<
  Record<DatabaseErrorType, (error: DatabaseError) => AppError>
> = {
  [DatabaseErrorType.UniqueConstraintViolation]: (error) => {
    const { table_name, detail } = error;
    return new ConflictError(formatConflictError(table_name, detail));
  },
  [DatabaseErrorType.ForeignKeyViolation]: () =>
    new BadRequestError(
      `The related resource does not exist. Please ensure the referenced data exists.`,
    ),
  [DatabaseErrorType.CheckConstraintViolation]: () =>
    new BadRequestError(`The value provided is out of the acceptable range.`),
  [DatabaseErrorType.NullValueNotAllowed]: () => new BadRequestError(`Null value is not allowed`),
  [DatabaseErrorType.ConnectionFailure]: () =>
    new InternalServerError(`Database connection failure. Please try again later.`),
};

// function that maps a database error to app error
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

// logging database error for more details
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
