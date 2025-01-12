import { paths } from "@/gen/openapi";
import createFetchClient, { Middleware } from "openapi-fetch";
import { API_BASE_URL } from "@/constants/api";
import { handleHTTPStatusError } from "@/utilities/errors";
import { getAuthToken } from "@/utilities/device-token";
import { User } from "@/types/user";

const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

const middleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      handleHTTPStatusError(response.status, `Error found ${response.statusText}`);
    }
  },
};

/**
 * Wraps Client API Requests with authorizations
 */
export const authWrapper = () => async (userFn: (token: string) => Promise<User>) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Authorization token is missing.");
  }
  return userFn(token);
};

fetchClient.use(middleware);

export default fetchClient;
