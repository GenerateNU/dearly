import { z } from "zod";
import { AppError, BadRequestError, ConflictError, InternalServerError } from "./app-error";
import logger from "../logger";

enum DatabaseErrorType {
  UniqueConstraintViolation = "23505",
  ForeignKeyViolation = "23503",
  CheckConstraintViolation = "23514",
  ExclusionConstraintViolation = "23P01",
  InvalidCredentials = "28000",
  InvalidPassword = "28P01",
  InsufficientPrivilege = "42501",
  DivisionByZero = "22012",
  StringDataRightTruncation = "22001",
  InvalidTextRepresentation = "22P02",
  NumericValueOutOfRange = "22003",
  NullValueNotAllowed = "22004",
  SerializationFailure = "40001",
  DeadlockDetected = "40P01",
  SyntaxError = "42601",
  UndefinedTable = "42P01",
  UndefinedColumn = "42703",
  AmbiguousColumn = "42702",
  ConnectionFailure = "08006",
  DiskFull = "53100",
  OutOfMemory = "53200",
}

const DatabaseErrorSchema = z
  .object({
    code: z.nativeEnum(DatabaseErrorType),
    detail: z.string(),
    message: z.string(),
  })
  .passthrough();

type DatabaseError = z.infer<typeof DatabaseErrorSchema>;

const isDatabaseError = (error: unknown): error is DatabaseError => {
  try {
    DatabaseErrorSchema.parse(error);
    return true;
  } catch {
    return false;
  }
};

// lookup object for database error mapping
const DATABASE_ERROR_MAP: Partial<Record<DatabaseErrorType, AppError>> = {
  [DatabaseErrorType.UniqueConstraintViolation]: new ConflictError(
    `The value you provided already exists. Please choose a different value.`,
  ),
  [DatabaseErrorType.ForeignKeyViolation]: new BadRequestError(
    `The related resource does not exist. Please ensure the referenced data exists.`,
  ),
  [DatabaseErrorType.CheckConstraintViolation]: new BadRequestError(
    `The value provided is out of the acceptable range.`,
  ),
  [DatabaseErrorType.NullValueNotAllowed]: new BadRequestError(`Null value is not allowed`),
};

// map a database error to app error
const mapDBErrorToAppError = (error: unknown): AppError => {
  // parse and validate the error using the Zod schema
  const dbError = DatabaseErrorSchema.safeParse(error);

  if (!dbError.success) {
    logger.error("Invalid database error:", error);
    return new InternalServerError("An unexpected database error occurred.");
  }

  // extract parsed error data
  const { code, detail, message } = dbError.data;
  logger.error(formatDBLogError(code, detail, message));

  // Use the lookup map to handle the database error or fallback
  const mapError = DATABASE_ERROR_MAP[code] || new InternalServerError("Unexpected error occurs.");
  return mapError;
};

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
