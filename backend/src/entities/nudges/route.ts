import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { NudgeController, NudgeControllerImpl } from "./controller";
import { NudgeTransaction, NudgeTransactionImpl } from "./transaction";
import { NudgeService, NudgeServiceImpl } from "./service";
import { Expo } from "expo-server-sdk";

export const nudgeRoutes = (db: PostgresJsDatabase, expo: Expo): Hono => {
  const nudge = new Hono();

  const nudgeTransaction: NudgeTransaction = new NudgeTransactionImpl(db);
  const nudgeService: NudgeService = new NudgeServiceImpl(nudgeTransaction, expo);
  const nudgeController: NudgeController = new NudgeControllerImpl(nudgeService);

  nudge.put("/manual", (ctx) => nudgeController.manualNudge(ctx));

  return nudge;
};
