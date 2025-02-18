import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { NudgeController, NudgeControllerImpl } from "./controller";
import { NudgeTransaction, NudgeTransactionImpl } from "./transaction";
import { NudgeService, NudgeServiceImpl } from "./service";
import { ExpoPushService } from "../../services/notification/expo";

export const nudgeRoutes = (db: PostgresJsDatabase, expoService: ExpoPushService): Hono => {
  const nudge = new Hono();

  const nudgeTransaction: NudgeTransaction = new NudgeTransactionImpl(db);
  const nudgeService: NudgeService = new NudgeServiceImpl(nudgeTransaction, expoService);
  const nudgeController: NudgeController = new NudgeControllerImpl(nudgeService);

  nudge.post("/manual", (ctx) => nudgeController.manualNudge(ctx));

  return nudge;
};
