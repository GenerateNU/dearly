import { Hono } from "hono";
import { getConfigurations } from "../../config/config";
import { connectDB } from "../../database/connect";
import { configureMiddlewares } from "../../middlewares/init";
import { setUpRoutes } from "../../routes/init";
import { automigrateDB } from "../../database/migrate";
import { resetDB } from "../../database/reset";

export const startTestApp = async (): Promise<Hono> => {
  const app = new Hono();

  const config = getConfigurations();

  const db = connectDB(config);

  await automigrateDB(db, config);

  await resetDB(db);

  configureMiddlewares(app, config);

  setUpRoutes(app, db);

  return app;
};
