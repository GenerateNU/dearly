import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { NudgeController, NudgeControllerImpl } from "./controller";
import { NudgeTransaction, NudgeTransactionImpl } from "./transaction";
import { NudgeService, NudgeServiceImpl } from "./service";

export const postRoutes = (db: PostgresJsDatabase): Hono => {
  const nudge = new Hono();

  const nudgeTransaction: NudgeTransaction = new NudgeTransactionImpl(db);
  const nudgeService: NudgeService = new NudgeServiceImpl(nudgeTransaction);
  const nudgeController: NudgeController = new NudgeControllerImpl(nudgeService);

  nudge.put("/groups/:id/nudges/manual", (ctx) => nudgeController.manualNudge(ctx));

  return nudge;
};
