import { components, paths } from "@/gen/openapi";

export type MediaUpload = components["schemas"]["MediaUpload"];

export type UploadMediaPayload =
  paths["/api/v1/groups/{id}/media"]["post"]["requestBody"]["content"]["multipart/form-data"];

export type UploadMediaResponse =
  paths["/api/v1/groups/{id}/media"]["post"]["responses"]["201"]["content"]["application/json"];
