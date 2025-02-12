import { SlackConfig } from "./../types/config";
import { Context } from "hono";
import { handleAppError } from "../utilities/errors/app-error";
import * as crypto from "crypto";

interface ExpoBuildWebhookPayload {
  status: string;
  artifacts?: {
    url?: string;
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
        return ctx.json("Signatures didn't match", 500);
      }

      const payload = JSON.parse(bodyText) as ExpoBuildWebhookPayload;

      if (payload.status === "finished") {
        await this.sendSlackMessage(payload);
        return ctx.text("Successfully sent slack notification", 200);
      }

      return ctx.text("Build not finished, no notification sent", 200);
    };
    return await handleAppError(slackMessageImpl)(ctx);
  }

  private async generateQRCodeUrl(buildUrl: string): Promise<string> {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(buildUrl)}`;
  }

  private async sendSlackMessage(payload: ExpoBuildWebhookPayload): Promise<void> {
    const buildUrl = payload.artifacts?.url || payload.buildDetailsPageUrl;

    if (!buildUrl) {
      throw new Error("No build URL available in the payload");
    }

    const qrCodeUrl = await this.generateQRCodeUrl(buildUrl);

    const messagePayload = {
      channel: this.config.slackChannelID,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey <!subteam^${this.config.slackUserID}> designers and engineers 💛\n\nA new iOS build of Dearly is now ready for UI/UX testing!\n\n`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `You can access the build in two ways:\n• <${buildUrl}|Click here to download build directly> ✨\n`,
          },
        },
        {
          type: "image",
          title: {
            type: "plain_text",
            text: `QR Code for iOS Build`,
          },
          image_url: qrCodeUrl,
          alt_text: "QR Code for the build URL",
        },
      ],
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
