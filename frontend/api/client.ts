import { paths } from "@/gen/openapi";
import createFetchClient, { Middleware } from "openapi-fetch";
import { API_BASE_URL } from "@/constants/api";
import { handleHTTPStatusError } from "@/utilities/errors";

const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

// Might need to break this up
const middleware: Middleware = {
  async onResponse(res) {
    const response = res.response;
    const error = await response.json();
    if (!response.ok) {
      handleHTTPStatusError(response.status, error);
    }
  },
};

fetchClient.use(middleware);

export default fetchClient;
