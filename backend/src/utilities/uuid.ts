import { validate } from "uuid";
import { BadRequestError } from "./errors/app-error";

export const parseUUID = (id: string): string => {
  const trimmedId = id.trim();
  if (validate(trimmedId)) {
    return trimmedId;
  } else {
    throw new BadRequestError("Invalid ID format");
  }
};
