import { Hono } from "hono";
import { getConfigurations } from "./config/config";
import { connectDB } from "./database/connect";
import { configureMiddlewares } from "./middlewares/init";
import { setUpRoutes } from "./routes/init";
import { automigrateDB } from "./database/migrate";
import { S3Impl } from "./services/s3Service";
import { SchedulerClient } from "@aws-sdk/client-scheduler";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { AWSLambda } from "./services/lambda"
import { AWSEventBridgeScheduler } from "./services/nudgeScheduler";

const app = new Hono();

const config = getConfigurations();
const SEND_NUDGE_LAMBDA_NAME = "sendNudgeNotification";
const SEND_NUDGE_FILE_PATH = "./services/lambda_functions/sendNudgeNotification_files/sendNudgeLambda_package.zip";

(async function setUpServer() {
  const s3ServiceProvider = new S3Impl(config.s3Config);
  const schedulerClient = new SchedulerClient();
  const lambdaClient = new LambdaClient();
  const sendNudgeLambda = new AWSLambda(lambdaClient);
  sendNudgeLambda.createSendNudgeFunction(SEND_NUDGE_LAMBDA_NAME, SEND_NUDGE_FILE_PATH);

  const scheduler = new AWSEventBridgeScheduler(schedulerClient, sendNudgeLambda)

  try {
    const db = connectDB(config);

    await automigrateDB(db, config);

    configureMiddlewares(app, config);

    setUpRoutes(app, db, s3ServiceProvider, scheduler);

    console.log("Successfully initialize app");
  } catch (error) {
    console.error("Error during application initialization:", error);
    process.exit(1);
  }
})();

const server = {
  port: config.server.port,
  fetch: app.fetch,
};

export default server;
