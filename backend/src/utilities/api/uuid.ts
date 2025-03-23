import { validate } from "uuid";
import { BadRequestError } from "../errors/app-error";

export const parseUUID = (id: string, entity?: string): string => {
  const trimmedId = id.trim();
  if (validate(trimmedId)) {
    return trimmedId;
  } else {
    const error = entity ? `Invalid ${entity} ID format` : "Invalid ID format";
    throw new BadRequestError(error);
  }
};
