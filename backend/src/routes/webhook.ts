import { SlackConfig } from "./../types/config";
import { Context } from "hono";
import { handleAppError } from "../utilities/errors/app-error";
import * as crypto from "crypto";
import { getSlackMessage } from "../utilities/slack";

interface ExpoBuildWebhookPayload {
  status: string;
  artifacts?: {
    buildUrl?: string;
  };
  platform: string;
  buildDetailsPageUrl?: string;
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
      const bodyText = await ctx.req.text();

      const hmac = crypto.createHmac(
        "sha1",
        this.config.expoSignature as crypto.BinaryLike | crypto.KeyObject,
      );
      hmac.update(bodyText);
      const hash = `sha1=${hmac.digest("hex")}`;

      if (expoSignature !== hash) {
        return ctx.json("Signatures didn't match", 403);
      }

      try {
        const payload = JSON.parse(bodyText) as ExpoBuildWebhookPayload;
        if (payload.status === "finished") {
          await this.sendSlackMessage(payload);
          return ctx.text("Successfully sent slack notification", 200);
        }
      } catch {
        return ctx.json({ error: "Invalid payload" }, 500);
      }
      return ctx.text("Build not finished, no notification sent", 200);
    };
    return await handleAppError(slackMessageImpl)(ctx);
  }

  private async generateQRCodeUrl(buildUrl: string): Promise<string> {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(buildUrl)}`;
  }

  private async sendSlackMessage(payload: ExpoBuildWebhookPayload): Promise<void> {
    const buildUrl = payload.artifacts?.buildUrl || payload.buildDetailsPageUrl;

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
