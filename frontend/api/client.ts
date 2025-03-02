import { paths } from "@/gen/openapi";
import createFetchClient, { Middleware } from "openapi-fetch";
import { handleHTTPStatusError } from "@/utilities/errors";
import { API_BASE_URL } from "@/constants/api";

const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

const middleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      handleHTTPStatusError(response.status, `Error found ${response.statusText}`);
    }
  },
  async onError({ error }) {
    console.log(error);
  },
};

fetchClient.use(middleware);

export default fetchClient;
