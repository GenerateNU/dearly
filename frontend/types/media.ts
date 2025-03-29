import { components, paths } from "@/gen/openapi";

export type MediaUpload = components["schemas"]["MediaUpload"];
export type Media = components["schemas"]["MediaWithURL"];
export type Waveform = components["schemas"]["WaveForm"];

export type UploadMediaPayload =
  paths["/api/v1/groups/{id}/media"]["post"]["requestBody"]["content"]["multipart/form-data"];

export type UploadUserPayload =
  paths["/api/v1/users/media"]["post"]["requestBody"]["content"]["multipart/form-data"];

export type processMediaPayload =
  paths["/api/v1/media/processing"]["post"]["requestBody"]["content"]["application/json"];

export type UploadGroupMediaResponse =
  paths["/api/v1/groups/{id}/media"]["post"]["responses"]["201"]["content"]["application/json"];

export type UploadUserMediaResponse =
  paths["/api/v1/users/media"]["post"]["responses"]["201"]["content"]["application/json"];
