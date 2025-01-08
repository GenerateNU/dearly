import { paths } from "@/gen/openapi";
import createClient from "openapi-react-query";
import createFetchClient from "openapi-fetch";
import { API_BASE_URL } from "@/constants/api";

const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

export const $api = createClient(fetchClient);
