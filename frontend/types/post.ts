import { components, paths } from "@/gen/openapi";

export type Post = components["schemas"]["PostWithURL"];

export type CreatePostPayload =
  paths["/api/v1/groups/{id}/posts"]["post"]["requestBody"]["content"]["application/json"];

export type UpdatePostPayload =
  paths["/api/v1/posts/{id}"]["patch"]["requestBody"]["content"]["application/json"];

export type LikePostUsers =
  paths["/api/v1/posts/{id}/likes"]["get"]["responses"]["200"]["content"]["application/json"];

export type CreateCommentPayload =
  paths["/api/v1/posts/{id}/comments"]["post"]["requestBody"]["content"]["application/json"];

export type Comments =
  paths["/api/v1/posts/{id}/comments"]["get"]["responses"]["200"]["content"]["application/json"];
