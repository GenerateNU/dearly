const DEFAULT_UNHANDLED_ERROR = "An unexpected error occurred. Please try again.";

const statusCodeErrorMap = new Map<number, string>([
  [400, "Invalid data. Please check the input fields."],
  [401, "Unauthorized. Please log in again."],
  [403, "Forbidden. You don't have permission to do this action."],
  [404, "Resource not found. Please try again."],
  [500, "Internal server error. Please try again later."],
  [503, "Service unavailable. Please try again later."],
]);

export const handleHTTPStatusError = (status: number, data: any) => {
  const errorMessage = data.error || statusCodeErrorMap.get(status) || DEFAULT_UNHANDLED_ERROR;
  throw new Error(errorMessage);
};

export const handleNetworkError = (error: any) => {
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error. Please check your connection.");
    }

    throw new Error(error.message || DEFAULT_UNHANDLED_ERROR);
  } else {
    throw new Error(DEFAULT_UNHANDLED_ERROR);
  }
};
