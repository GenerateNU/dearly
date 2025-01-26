import { Hono } from "hono";
import { InvitationController, InvitationControllerImpl } from "./controller";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { InvitationTransaction, InvitationTransactionImpl } from "./transaction";
import { InvitationService, InvitationServiceImpl } from "./service";

export const invitationRoutes = (db: PostgresJsDatabase): Hono => {
  const invite = new Hono();
  const invitationTransaction: InvitationTransaction = new InvitationTransactionImpl(db);
  const invitationService: InvitationService = new InvitationServiceImpl(invitationTransaction);
  const invitationController: InvitationController = new InvitationControllerImpl(
    invitationService,
  );

  invite.get("/:groupId/invites", (ctx) => invitationController.createInviteToken(ctx));
  invite.put("/:token/verify", (ctx) => invitationController.verifyInviteToken(ctx));

  return invite;
};
