import { validate } from "uuid";
import { BadRequestError } from "../errors/app-error";

/**
 * Validates and parses a UUID string.
 *
 * @param id - The UUID string to validate and parse
 * @param entity - Optional entity name to include in error message if validation fails
 * @returns The validated and trimmed UUID string
 * @throws BadRequestError if the provided string is not a valid UUID
 *
 * @example
 * // Returns the validated UUID
 * parseUUID("123e4567-e89b-12d3-a456-426614174000")
 *
 * // With entity name in error
 * parseUUID("invalid-uuid", "User") // Throws: "Invalid User ID format"
 *
 * // Without entity name
 * parseUUID("invalid-uuid") // Throws: "Invalid ID format"
 */
export const parseUUID = (id: string, entity?: string): string => {
  const trimmedId = id.trim();
  if (validate(trimmedId)) {
    return trimmedId;
  } else {
    const error = entity ? `Invalid ${entity} ID format` : "Invalid ID format";
    throw new BadRequestError(error);
  }
};
