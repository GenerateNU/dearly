import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { NudgeController, NudgeControllerImpl } from "./controller";
import { NudgeTransaction, NudgeTransactionImpl } from "./transaction";
import { NudgeService, NudgeServiceImpl } from "./service";
import { Expo } from "expo-server-sdk";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

export const nudgeRoutes = (
  db: PostgresJsDatabase,
  expo: Expo,
  scheduler: SchedulerClient,
): Hono => {
  const nudge = new Hono();
  const nudgeTransaction: NudgeTransaction = new NudgeTransactionImpl(db);
  const nudgeService: NudgeService = new NudgeServiceImpl(nudgeTransaction, expo, scheduler);
  const nudgeController: NudgeController = new NudgeControllerImpl(nudgeService);

  nudge.post("/manual", (ctx) => nudgeController.manualNudge(ctx));
  nudge.post("/auto", (ctx) => nudgeController.upsertSchedule(ctx));
  nudge.get("/auto", (ctx) => nudgeController.getSchedule(ctx));
  nudge.put("/auto", (ctx) => nudgeController.deactivateSchedule(ctx));

  return nudge;
};
