import { InternalServerError, isAppError } from "./app-error";
import { isDatabaseError, mapDBErrorToAppError } from "./db-error";

export const handleServiceError = <T>(fn: () => T) => {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      } else if (isDatabaseError(error)) {
        throw mapDBErrorToAppError(error);
      } else {
        throw new InternalServerError("An unexpected server error occurred.");
      }
    }
  };
};
