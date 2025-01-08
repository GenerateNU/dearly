import { paths } from "@/gen/openapi";
import createFetchClient, { Middleware } from "openapi-fetch";
import { API_BASE_URL } from "@/constants/api";

const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

// Might need to break this up
const middleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      throw new Error("Sample Error");
    }
  },
};

fetchClient.use(middleware);

export default fetchClient;
