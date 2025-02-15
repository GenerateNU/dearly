import { SlackConfig } from "./../types/config";
import { Context } from "hono";
import { handleAppError } from "../utilities/errors/app-error";
import * as crypto from "crypto";
import { getSlackMessage } from "../utilities/slack";
import logger from "../utilities/logger";

interface ExpoBuildWebhookPayload {
  status: "errored" | "finished" | "canceled";
  artifacts?: {
    buildUrl?: string;
  };
  platform: "ios" | "android";
  buildDetailsPageUrl?: string;
  error?: {
    message?: string;
    errorCode?: string;
  };
}

export interface SlackController {
  receiveBuildEvent(ctx: Context): Promise<Response>;
}

export class SlackControllerImpl implements SlackController {
  private config: SlackConfig;
  readonly QR_CODE_SIZE = 300;

  constructor(config: SlackConfig) {
    this.config = config;
  }

  async receiveBuildEvent(ctx: Context): Promise<Response> {
    const slackMessageImpl = async () => {
      const expoSignature = ctx.req.header("expo-signature");
      const bodyText = await ctx.req.text();
      this.checkSignature(bodyText, expoSignature, ctx);

      const payload = JSON.parse(bodyText) as ExpoBuildWebhookPayload;
      await this.checkStatus(payload, ctx);
      return ctx.text("Build not finished, no notification sent", 200);
    };
    return await handleAppError(slackMessageImpl)(ctx);
  }

  private checkSignature(bodyText: string, expoSignature: string | undefined, ctx: Context) {
    const hmac = crypto.createHmac(
      "sha1",
      this.config.expoSignature as crypto.BinaryLike | crypto.KeyObject,
    );
    hmac.update(bodyText);
    const hash = `sha1=${hmac.digest("hex")}`;

    if (expoSignature !== hash) {
      return ctx.json("Signatures didn't match", 403);
    }
  }

  private async checkStatus(payload: ExpoBuildWebhookPayload, ctx: Context) {
    if (payload.status === "finished") {
      await this.sendSlackMessage(payload);
      return ctx.text("Successfully sent slack notification", 200);
    } else if (payload.status === "errored") {
      logger.warn("Failed to build:", payload.error!.message);
      return ctx.text("Failed to build", 200);
    }
    return ctx.text("Build cancelled", 200);
  }

  private async generateQRCodeUrl(buildUrl: string): Promise<string> {
    return `${this.config.qrCodeGenerator}/?size=${this.QR_CODE_SIZE}x${this.QR_CODE_SIZE}&data=${encodeURIComponent(buildUrl)}`;
  }

  private async sendSlackMessage(payload: ExpoBuildWebhookPayload): Promise<void> {
    const buildUrl = payload.buildDetailsPageUrl;

    if (!buildUrl) {
      throw new Error("No build URL available in the payload");
    }

    const qrCodeUrl = await this.generateQRCodeUrl(buildUrl);

    const messagePayload = {
      channel: this.config.slackChannelID,
      blocks: getSlackMessage(qrCodeUrl, buildUrl, this.config.slackUserID),
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
