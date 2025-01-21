import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { MemberTransaction, MemberTransactionImpl } from "./transaction";
import { MemberService, MemberServiceImpl } from "./service";
import { MemberController, MemberControllerImpl } from "./controller";

export const memberRoutes = (db: PostgresJsDatabase): Hono => {
  const member = new Hono();

  const memberTransaction: MemberTransaction = new MemberTransactionImpl(db);
  const memberService: MemberService = new MemberServiceImpl(memberTransaction);
  const memberController: MemberController = new MemberControllerImpl(memberService);

  member.post("/:userId", (ctx) => memberController.addMember(ctx));
  member.delete("/:userId", (ctx) => memberController.deleteMember(ctx));
  member.delete("/", (ctx) => memberController.getMembers(ctx));

  return member;
};