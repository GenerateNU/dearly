import { API_BASE_URL } from "./../constants/api";
import { paths } from "@/gen/openapi";
import createFetchClient, { Middleware } from "openapi-fetch";
import { handleHTTPStatusError } from "@/utilities/errors";

const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
});

const middleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      handleHTTPStatusError(response.status, `Error found ${response.statusText}`);
    }
  },
  async onRequest({ request }) {
    console.log(request);
  }
};

fetchClient.use(middleware);

export default fetchClient;
