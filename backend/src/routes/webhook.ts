import { SlackConfig } from "./../types/config";
import { Context } from "hono";
import {
  BadRequestError,
  ForbiddenError,
  handleAppError,
  InternalServerError,
} from "../utilities/errors/app-error";
import * as crypto from "crypto";
import { getSlackMessage } from "../utilities/monitoring/slack";
import logger from "../utilities/monitoring/logger";
import { Status } from "../constants/http";

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
  metadata: {
    buildProfile: "production" | "preview" | "development";
  };
}

/**
 * Interface that defines the operations for receiving Expo build events and sending notifications to Slack.
 */
export interface SlackController {
  /**
   * Receives the Expo build webhook event and processes it based on the build status.
   * It verifies the signature of the event, checks the build status, and sends a Slack message
   * if the build is finished or errored (for non-production builds).
   *
   * @param ctx - The context of the HTTP request, containing the event data sent by Expo and the request headers.
   * @returns A response indicating the result of processing the build event.
   * @throws ForbiddenError if the signature verification fails.
   * @throws InternalServerError if sending a Slack message fails.
   * @throws BadRequestError if the build URL is missing in the event payload.
   */
  receiveBuildEvent(ctx: Context): Promise<Response>;
}

/**
 * Implementation of the `SlackController` interface, responsible for handling incoming Expo build webhook events.
 * It verifies the build status and sends a Slack notification when appropriate.
 */
export class SlackControllerImpl implements SlackController {
  private config: SlackConfig;
  readonly QR_CODE_SIZE = 300;

  /**
   * Creates an instance of the `SlackControllerImpl` class.
   *
   * @param config - The configuration for the Slack integration, including the webhook URL and channel ID.
   */
  constructor(config: SlackConfig) {
    this.config = config;
  }

  /**
   * Processes the incoming Expo build webhook event.
   * Verifies the signature of the request, checks the build status, and sends a Slack message for finished or errored builds.
   *
   * @param ctx - The context of the HTTP request containing the build event data.
   * @returns A response indicating the status of the processing, including whether the Slack notification was sent or not.
   */
  async receiveBuildEvent(ctx: Context): Promise<Response> {
    const slackMessageImpl = async () => {
      const expoSignature = ctx.req.header("expo-signature");
      const bodyText = await ctx.req.text();

      // Verify whether it is a valid payload from Expo
      this.checkSignature(bodyText, expoSignature);
      const payload = JSON.parse(bodyText) as ExpoBuildWebhookPayload;

      // Only process non-production builds
      if (payload.metadata.buildProfile === "production") {
        return ctx.text("New production build, message not sent to Slack", Status.OK);
      }

      // Check build status and take appropriate actions
      if (payload.status === "finished") {
        await this.sendSlackMessage(payload);
        return ctx.text("Successfully sent Slack notification", Status.OK);
      } else if (payload.status === "errored") {
        logger.warn("Failed to build:", payload.error!.message);
        return ctx.text("Failed to build", Status.OK);
      } else if (payload.status === "canceled") {
        return ctx.text("Build canceled", Status.OK);
      }
      return ctx.text("Build not finished, no notification sent", Status.OK);
    };
    return await handleAppError(slackMessageImpl)(ctx);
  }

  /**
   * Verifies the Expo signature to ensure the payload is from a trusted source.
   *
   * @param bodyText - The body of the request containing the Expo build event data.
   * @param expoSignature - The signature sent by Expo for verifying the authenticity of the payload.
   * @throws ForbiddenError if the signature verification fails.
   */
  private checkSignature(bodyText: string, expoSignature: string | undefined) {
    const hmac = crypto.createHmac(
      "sha1",
      this.config.expoSignature as crypto.BinaryLike | crypto.KeyObject,
    );
    hmac.update(bodyText);
    const hash = `sha1=${hmac.digest("hex")}`;

    if (expoSignature !== hash) {
      throw new ForbiddenError();
    }
  }

  /**
   * Generates a QR code URL for the build URL that can be shared in the Slack message.
   *
   * @param buildUrl - The URL for the build details page.
   * @returns The URL of the generated QR code.
   */
  private async generateQRCodeUrl(buildUrl: string): Promise<string> {
    return `${this.config.qrCodeGenerator}/?size=${this.QR_CODE_SIZE}x${this.QR_CODE_SIZE}&data=${encodeURIComponent(buildUrl)}`;
  }

  /**
   * Sends a Slack message with the build information and a generated QR code for the build URL.
   *
   * @param payload - The payload containing build details, including the build URL and other relevant information.
   * @throws InternalServerError if the Slack message cannot be sent.
   */
  private async sendSlackMessage(payload: ExpoBuildWebhookPayload): Promise<void> {
    const buildUrl = payload.buildDetailsPageUrl;

    if (!buildUrl) {
      throw new BadRequestError("No build URL available in the payload");
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
      throw new InternalServerError(`Failed to send Slack message: ${response.statusText}`);
    }
  }
}
