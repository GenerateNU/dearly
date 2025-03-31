import { InternalServerError } from "./app-error";
import logger from "../monitoring/logger";

/**
 * Handles AWS service errors by mapping them to a response.
 *
 * @param fn - The function to execute
 * @param message - The error message to return
 * @returns A response object with the appropriate status code and message
 */
export const handleAWSServiceError = <T>(fn: () => T, message: string) => {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      logger.error(error);
      throw new InternalServerError(message);
    }
  };
};
