import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { NudgeController, NudgeControllerImpl } from "./controller";
import { NudgeTransaction, NudgeTransactionImpl } from "./transaction";
import { NudgeService, NudgeServiceImpl } from "./service";
import { PushNotificationService } from "../../services/notification/expo";
import { NudgeSchedulerService } from "../../services/nudgeScheduler";

export const nudgeRoutes = (
  db: PostgresJsDatabase,
  expoService: PushNotificationService,
  scheduler: NudgeSchedulerService,
): Hono => {
  const nudge = new Hono();
  const nudgeTransaction: NudgeTransaction = new NudgeTransactionImpl(db);
  const nudgeService: NudgeService = new NudgeServiceImpl(nudgeTransaction, expoService, scheduler);
  const nudgeController: NudgeController = new NudgeControllerImpl(nudgeService);

  nudge.post("/manual", (ctx) => nudgeController.manualNudge(ctx));
  nudge.put("/auto", (ctx) => nudgeController.upsertSchedule(ctx));
  nudge.get("/auto", (ctx) => nudgeController.getSchedule(ctx));
  nudge.put("/auto/off", (ctx) => nudgeController.deactivateSchedule(ctx));

  return nudge;
};
