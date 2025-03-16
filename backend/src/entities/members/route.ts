import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { MemberTransaction, MemberTransactionImpl } from "./transaction";
import { MemberService, MemberServiceImpl } from "./service";
import { MemberController, MemberControllerImpl } from "./controller";
import { MediaService } from "../media/service";

export const memberRoutes = (db: PostgresJsDatabase, mediaService: MediaService): Hono => {
  const member = new Hono();

  const memberTransaction: MemberTransaction = new MemberTransactionImpl(db);
  const memberService: MemberService = new MemberServiceImpl(memberTransaction, mediaService);
  const memberController: MemberController = new MemberControllerImpl(memberService);

  member.post("/:userId", (ctx) => memberController.addMember(ctx));
  member.delete("/:userId", (ctx) => memberController.deleteMember(ctx));
  member.get("/info", (ctx) => memberController.getMember(ctx));
  member.get("/", (ctx) => memberController.getMembers(ctx));
  member.get("/:userId/posts", (ctx) => memberController.getMemberPosts(ctx));
  member.patch("/notifications", (ctx) => memberController.toggleNotification(ctx));

  return member;
};
