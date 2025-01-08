import { paths } from "@/gen/openapi";
import createClient from "openapi-react-query";
import createFetchClient from "openapi-fetch";
import { API_BASE_URL } from "@/constants/api";

export const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

// Add this to a provider inside frontend components
export const $api = createClient(fetchClient);
