import { InternalServerError } from "./app-error";
import logger from "../logger";


export const handleAWSServiceError = <T>(fn: () => T, message: string) => {
return async () => {
    try {
        return await fn();
    } catch (error) {
        logger.error(error);
        throw new InternalServerError(message)
    }
}
}
