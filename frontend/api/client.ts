import { paths } from "@/gen/openapi";
import createFetchClient, { Middleware } from "openapi-fetch";
import { handleHTTPStatusError } from "@/utilities/errors";

const fetchClient = createFetchClient<paths>({
  baseUrl: "https://ebae-155-33-134-3.ngrok-free.app/",
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
