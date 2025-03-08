import { components, paths } from "@/gen/openapi";

export type Group = components["schemas"]["Group"];

export enum GroupAction {
  JOIN = "Join Group",
  CREATE = "Create Group",
}

export type CreateGroupPayload =
  paths["/api/v1/groups"]["post"]["requestBody"]["content"]["application/json"];

export type UpdateGroupPayload =
  paths["/api/v1/groups/{id}"]["patch"]["requestBody"]["content"]["application/json"];

export type GroupCalendar =
  paths["/api/v1/groups/{id}/calendar"]["get"]["responses"]["200"]["content"]["application/json"];

export type GroupPostFeed =
  paths["/api/v1/groups/{id}/feed"]["get"]["responses"]["200"]["content"]["application/json"];

export type GroupMembers =
  paths["/api/v1/groups/{id}/members"]["get"]["responses"]["200"]["content"]["application/json"];

export type InvitationToken =
  paths["/api/v1/groups/{groupId}/invites"]["get"]["responses"]["200"]["content"]["application/json"];

export type MemberPosts =
  paths["/api/v1/groups/{id}/members/{userId}/posts"]["get"]["responses"]["200"]["content"]["application/json"];
