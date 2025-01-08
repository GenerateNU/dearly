import { components } from "@/gen/openapi";

export type ERROR = components["schemas"]["Error"];
export type VALIDATION_ERROR = components["schemas"]["ValidationError"];
export type API_ERROR = ERROR | VALIDATION_ERROR;
