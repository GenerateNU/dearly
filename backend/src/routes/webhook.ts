import { SlackConfig } from "./../types/config";
import { Context } from "hono";
import { handleAppError } from "../utilities/errors/app-error";
import * as crypto from "crypto";
import logger from "../utilities/logger";
import { getSlackMessage } from "../utilities/slack";

interface ExpoSubmitWebhookPayload {
  status: "errored" | "finished" | "canceled";
  platform: "android" | "ios";
  submissionInfo?: {
    error?: {
      message?: string;
      errorCode?: string;
    };
    logsUrl?: string;
  };
}

export interface SlackController {
  receiveBuildEvent(ctx: Context): Promise<Response>;
}

export class SlackControllerImpl implements SlackController {
  private config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
  }

  async receiveBuildEvent(ctx: Context): Promise<Response> {
    const slackMessageImpl = async () => {
      const expoSignature = ctx.req.header("expo-signature");
      if (!expoSignature) {
        return ctx.json({ error: "Missing expo-signature header" }, 400);
      }

      const rawBody = await ctx.req.text();
      if (!rawBody) {
        return ctx.json({ error: "Empty request body" }, 400);
      }

      const hmac = crypto.createHmac(
        "sha1",
        this.config.expoSignature as crypto.BinaryLike | crypto.KeyObject,
      );
      hmac.update(rawBody);
      const hash = `sha1=${hmac.digest("hex")}`;

      if (expoSignature !== hash) {
        return ctx.json({ error: "Invalid signature" }, 403);
      }

      try {
        const payload = JSON.parse(rawBody) as ExpoSubmitWebhookPayload;

        if (payload.status === "finished") {
          await this.sendSlackMessage();
          return ctx.json({ message: "Successfully sent slack notification" }, 200);
        }

        if (payload.status === "errored") {
          logger.warn("Failed to build:", payload.submissionInfo?.error?.message);
          return ctx.json({ message: "Error finishing the build" }, 200);
        }

        return ctx.json({ message: "Build not finished, no notification sent" }, 200);
      } catch (error) {
        logger.error("Failed to parse JSON payload:", error);
        return ctx.json({ error: "Invalid JSON payload" }, 400);
      }
    };
    return await handleAppError(slackMessageImpl)(ctx);
  }

  private async sendSlackMessage(): Promise<void> {
    const messagePayload = {
      channel: this.config.slackChannelID,
      blocks: getSlackMessage(this.config.slackUserID),
    };

    const response = await fetch(this.config.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messagePayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send Slack message: ${response.statusText}`);
    }
  }
}
