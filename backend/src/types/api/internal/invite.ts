import { invitationsTable, linksTable } from "../../../entities/schema";

export type CreateLinkPayload = typeof linksTable.$inferInsert;
export type CreateInvitePayload = typeof invitationsTable.$inferInsert;

export type GroupInvitation = {
  token: string;
};
