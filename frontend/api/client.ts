import { paths } from "@/gen/openapi";
import createFetchClient, { Middleware } from "openapi-fetch";
import { handleHTTPStatusError } from "@/utilities/errors";

const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.EXPO_API_BASE_URL,
});

const middleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      handleHTTPStatusError(response.status, `Error found ${response.statusText}`);
    }
  },
};

fetchClient.use(middleware);

export default fetchClient;
