import logger from "../monitoring/logger";
import { InternalServerError, isAppError } from "./app-error";
import { isDatabaseError, mapDBErrorToAppError } from "./db-error";

/**
 * Handles service errors by mapping them to a response.
 *
 * @param fn - The function to execute
 * @returns A response object with the appropriate status code and message
 */
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
        logger.error(error);
        throw new InternalServerError("An unexpected server error occurred.");
      }
    }
  };
};
