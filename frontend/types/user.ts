import { paths, components } from "@/gen/openapi";

export type User = Required<components["schemas"]["User"]>;

export type SearchedUser = components["schemas"]["SearchedUser"];

export type CreateUserPayload =
  paths["/api/v1/users"]["post"]["requestBody"]["content"]["application/json"];

export type UpdateUserPayload =
  paths["/api/v1/users/me"]["patch"]["requestBody"]["content"]["application/json"];

export type AgeGroup =
  paths["/api/v1/users"]["post"]["requestBody"]["content"]["application/json"]["ageGroup"];

export type UserGroups =
  paths["/api/v1/users/groups"]["get"]["responses"]["200"]["content"]["application/json"];
