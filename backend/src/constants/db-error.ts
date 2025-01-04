import { z } from "zod";

export enum DatabaseErrorType {
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

export const DatabaseErrorSchema = z
  .object({
    code: z.nativeEnum(DatabaseErrorType),
    detail: z.string(),
    message: z.string(),
    severity: z.string().optional(),
    severity_local: z.string().optional(),
    table_name: z.string().optional(),
    schema_name: z.string().optional(),
    constraint_name: z.string().optional(),
  })
  .passthrough();
